#!/bin/bash
aws s3 sync dist/ s3://$S3_BUCKET --acl=public-read --cache-control "public, max-age=31536000" --size-only --exclude "*.html" --exclude "manifest.webmanifest" --exclude "sitemap.xml"
aws s3 sync dist/ s3://$S3_BUCKET --acl=public-read --cache-control "public, max-age=0, must-revalidate" --size-only --exclude "*" --include "*.html" --include "manifest.webmanifest" --include "sitemap.xml"
aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_ID --paths "/*"
