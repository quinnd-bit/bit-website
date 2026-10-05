import os, json, hashlib, hmac, uuid, math
from datetime import datetime, timezone
import boto3
from boto3.dynamodb.conditions import Key

PAGES={'/','/about/','/capabilities/','/contact/','/offerings/','/global-status-report-for-buildings-and-construction/'}
table=boto3.resource('dynamodb').Table(os.environ['NOTES_TABLE'])

def response(code,payload):
    return {'statusCode':code,'headers':{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'},'body':json.dumps(payload)}

def normalise(path):
    if not isinstance(path,str): return ''
    path=path.replace('/index.html','/')
    return path if path.endswith('/') else path+'/'

def handler(event,context):
    headers={k.lower():v for k,v in event.get('headers',{}).items()}
    digest=hashlib.sha256(headers.get('authorization','').encode()).hexdigest()
    if not hmac.compare_digest(digest,os.environ['AUTH_HASH']):
        result=response(401,{'error':'Password required.'})
        result['headers']['WWW-Authenticate']='Basic realm="BIT beta", charset="UTF-8"'
        return result
    method=event.get('requestContext',{}).get('http',{}).get('method','GET')
    if event.get('rawPath')!='/api/sticky-notes': return response(404,{'error':'Not found.'})
    if method=='GET':
        page=normalise((event.get('queryStringParameters') or {}).get('path','/'))
        if page not in PAGES: return response(400,{'error':'Unknown page.'})
        items=[]
        args={'KeyConditionExpression':Key('pagePath').eq(page)}
        while True:
            result=table.query(**args)
            items.extend(result.get('Items',[]))
            if 'LastEvaluatedKey' not in result: break
            args['ExclusiveStartKey']=result['LastEvaluatedKey']
        notes=[json.loads(item['noteJson']) for item in items]
        notes.sort(key=lambda note:note['createdAt'])
        return response(200,{'notes':notes})
    if method!='POST': return response(405,{'error':'Method not allowed.'})
    if headers.get('origin') and headers['origin']!='https://beta.building-insights.org':
        return response(403,{'error':'Invalid origin.'})
    if not headers.get('content-type','').startswith('application/json'): return response(415,{'error':'Use JSON.'})
    raw=event.get('body') or ''
    if event.get('isBase64Encoded'):
        import base64
        raw=base64.b64decode(raw).decode()
    if len(raw.encode())>8192: return response(413,{'error':'Note too large.'})
    try:
        data=json.loads(raw)
        page=normalise(data.get('pagePath'))
        author=data.get('author','').strip()
        message=data.get('message','').strip()
        anchor=data.get('anchor',{})
        if page not in PAGES or not 1<=len(author)<=80 or not 1<=len(message)<=600: raise ValueError()
        selector=anchor.get('selector','')
        if not isinstance(selector,str) or not 1<=len(selector)<=1000: raise ValueError()
        clean={'selector':selector}
        for field in ('xRatio','yRatio','documentXRatio','documentYRatio'):
            value=anchor[field]
            if isinstance(value,bool) or not isinstance(value,(int,float)) or not math.isfinite(value) or not 0<=value<=1: raise ValueError()
            clean[field]=value
    except (ValueError,TypeError,KeyError,AttributeError):
        return response(400,{'error':'Invalid note. Add a name, suggestion, and page location.'})
    note={'id':str(uuid.uuid4()),'pagePath':page,'author':author,'message':message,'anchor':clean,'createdAt':datetime.now(timezone.utc).isoformat()}
    table.put_item(Item={'pagePath':page,'id':note['id'],'noteJson':json.dumps(note)},ConditionExpression='attribute_not_exists(id)')
    return response(201,{'note':note})
