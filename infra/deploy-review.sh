#!/usr/bin/env bash
set -euo pipefail
repo_root="$(cd "$(dirname "$0")/.." && pwd)"
# This command cannot select the historical production stack or bucket.
stack_name=bit-website-beta-review
region=ca-central-1
status="$(aws cloudformation describe-stacks --region "$region" --stack-name "$stack_name" --query 'Stacks[0].StackStatus' --output text)"
[[ "$status" == CREATE_COMPLETE || "$status" == UPDATE_COMPLETE ]] || { echo 'Beta stack is not ready.' >&2; exit 2; }
bucket="$(aws cloudformation describe-stacks --region "$region" --stack-name "$stack_name" --query "Stacks[0].Outputs[?OutputKey=='BucketName'].OutputValue" --output text)"
distribution="$(aws cloudformation describe-stacks --region "$region" --stack-name "$stack_name" --query "Stacks[0].Outputs[?OutputKey=='DistributionId'].OutputValue" --output text)"
[[ "$bucket" == bit-website-beta-review-* && "$distribution" != ER0IX6SE60XUF ]] || { echo 'Refusing a production destination.' >&2; exit 2; }
publish_dir="$(mktemp -d "${TMPDIR:-/tmp}/bit-beta-review.XXXXXX")"
trap 'rm -rf "$publish_dir"' EXIT
cp "$repo_root/index.html" "$repo_root/404.html" "$repo_root/favicon.ico" "$repo_root/apple-touch-icon.png" "$repo_root/favicon-neighbourhood-graphite.svg" "$repo_root/robots.txt" "$publish_dir/"
mkdir -p "$publish_dir/assets/brand/compositions" "$publish_dir/assets/css" "$publish_dir/assets/js" "$publish_dir/assets/icons"
cp "$repo_root/assets/brand/compositions/neighbourhood-signature.svg" "$publish_dir/assets/brand/compositions/"
cp "$repo_root/assets/css/site.css" "$repo_root/assets/css/sticky-notes.css" "$publish_dir/assets/css/"
cp "$repo_root/assets/js/site.js" "$repo_root/assets/js/sticky-notes.js" "$publish_dir/assets/js/"
cp "$repo_root/assets/icons/favicon-graphite-v2-32x32.png" "$repo_root/assets/icons/favicon-graphite-v2.svg" "$publish_dir/assets/icons/"
cp -R "$repo_root/assets/images" "$publish_dir/assets/images"
for page in about capabilities contact global-status-report-for-buildings-and-construction offerings; do
 mkdir -p "$publish_dir/$page"
 cp "$repo_root/$page/index.html" "$publish_dir/$page/index.html"
done
aws s3 sync "$publish_dir/" "s3://$bucket/" --region "$region" --delete --cache-control 'private,max-age=300,must-revalidate' --only-show-errors
aws cloudfront create-invalidation --distribution-id "$distribution" --paths '/*' --query 'Invalidation.Id' --output text
