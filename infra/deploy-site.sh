#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
stack_name="${STACK_NAME:-bit-website-beta}"
aws_region="${AWS_REGION:-ca-central-1}"
domain_name="${DOMAIN_NAME:-building-insights.org}"
www_domain_name="${WWW_DOMAIN_NAME:-www.building-insights.org}"
legacy_domain_name="${LEGACY_DOMAIN_NAME:-beta.building-insights.org}"
certificate_arn="${CERTIFICATE_ARN:-}"
enable_redirects="${ENABLE_CANONICAL_REDIRECTS:-false}"

if [[ -z "$certificate_arn" ]]; then
  echo 'CERTIFICATE_ARN is required and must reference an issued us-east-1 ACM certificate.' >&2
  exit 2
fi

if [[ "$enable_redirects" != 'true' && "$enable_redirects" != 'false' ]]; then
  echo 'ENABLE_CANONICAL_REDIRECTS must be true or false.' >&2
  exit 2
fi

publish_dir="$(mktemp -d "${TMPDIR:-/tmp}/bit-website-publish.XXXXXX")"
trap 'rm -rf "$publish_dir"' EXIT

cp "$repo_root/index.html" "$repo_root/404.html" "$repo_root/favicon.ico" \
  "$repo_root/favicon-neighbourhood-graphite.svg" "$publish_dir/"

mkdir -p \
  "$publish_dir/assets/brand/compositions" \
  "$publish_dir/assets/css" \
  "$publish_dir/assets/icons" \
  "$publish_dir/assets/js"
cp "$repo_root/assets/brand/compositions/neighbourhood-signature.svg" \
  "$publish_dir/assets/brand/compositions/"
cp "$repo_root/assets/css/site.css" "$publish_dir/assets/css/"
cp "$repo_root/assets/js/site.js" "$publish_dir/assets/js/"
cp "$repo_root/assets/icons/favicon-neighbourhood-graphite-32x32.png" \
  "$repo_root/assets/icons/apple-touch-icon-neighbourhood-graphite.png" \
  "$publish_dir/assets/icons/"
cp -R "$repo_root/assets/images" "$publish_dir/assets/images"

for page in about capabilities contact global-status-report-for-buildings-and-construction offerings; do
  mkdir -p "$publish_dir/$page"
  cp "$repo_root/$page/index.html" "$publish_dir/$page/index.html"
done

aws cloudformation deploy \
  --region "$aws_region" \
  --stack-name "$stack_name" \
  --template-file "$repo_root/infra/site.yaml" \
  --parameter-overrides \
    "DomainName=$domain_name" \
    "WwwDomainName=$www_domain_name" \
    "LegacyDomainName=$legacy_domain_name" \
    "CertificateArn=$certificate_arn" \
    "EnableCanonicalRedirects=$enable_redirects" \
  --tags Project=BITWebsite Environment=production ManagedBy=CloudFormation

bucket_name="$(aws cloudformation describe-stacks --region "$aws_region" --stack-name "$stack_name" --query "Stacks[0].Outputs[?OutputKey=='BucketName'].OutputValue" --output text)"
distribution_id="$(aws cloudformation describe-stacks --region "$aws_region" --stack-name "$stack_name" --query "Stacks[0].Outputs[?OutputKey=='DistributionId'].OutputValue" --output text)"
distribution_domain="$(aws cloudformation describe-stacks --region "$aws_region" --stack-name "$stack_name" --query "Stacks[0].Outputs[?OutputKey=='DistributionDomainName'].OutputValue" --output text)"

aws cloudfront wait distribution-deployed --id "$distribution_id"

aws s3 sync "$publish_dir/" "s3://$bucket_name/" \
  --region "$aws_region" \
  --delete \
  --cache-control 'public,max-age=300,must-revalidate'

while IFS= read -r -d '' html_file; do
  relative_path="${html_file#"$publish_dir/"}"
  aws s3 cp "$html_file" "s3://$bucket_name/$relative_path" \
    --region "$aws_region" \
    --content-type 'text/html; charset=utf-8' \
    --cache-control 'no-cache, max-age=0, must-revalidate'
done < <(find "$publish_dir" -type f -name '*.html' -print0)

invalidation_id="$(aws cloudfront create-invalidation \
  --distribution-id "$distribution_id" \
  --paths '/*' \
  --query 'Invalidation.Id' \
  --output text)"
aws cloudfront wait invalidation-completed --distribution-id "$distribution_id" --id "$invalidation_id"

downloaded_home="$publish_dir/deployed-index.html"
curl --fail --silent --show-error "https://$distribution_domain/index.html" --output "$downloaded_home"
cmp "$publish_dir/index.html" "$downloaded_home"

aws cloudformation describe-stacks \
  --region "$aws_region" \
  --stack-name "$stack_name" \
  --query 'Stacks[0].Outputs' \
  --output table
