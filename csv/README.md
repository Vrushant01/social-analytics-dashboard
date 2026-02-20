# Demo CSV Files

This folder contains sample CSV files for testing the Social Media Analytics Dashboard.

## Available Files

### 1. `demo-social-media-posts.csv`
- **Rows:** 20 posts
- **Format:** Standard format with `postId`, `caption`, `likes`, `comments_count`, `shares`, `timestamp`
- **Content:** Mix of positive, neutral, and negative sentiments with various emotions
- **Use Case:** General testing with diverse content

### 2. `demo-instagram-posts.csv`
- **Rows:** 15 posts
- **Format:** Instagram-style format with `post_id`, `caption`, `likes_count`, `comments_count`, `shares_count`, `created_at`
- **Content:** Instagram-focused content with hashtags and emojis
- **Use Case:** Testing Instagram-style data import

### 3. `demo-twitter-posts.csv`
- **Rows:** 15 posts
- **Format:** Twitter-style format with `id`, `text`, `likes`, `comments`, `shares`, `date`
- **Content:** Twitter-style short posts and updates
- **Use Case:** Testing Twitter-style data import

### 4. `demo-large-dataset.csv`
- **Rows:** 30 posts
- **Format:** Standard format with `postId`, `caption`, `likes`, `commentsCount`, `shares`, `timestamp`
- **Content:** Larger dataset for comprehensive testing
- **Use Case:** Testing with more data points and performance

## Supported Column Names

The system automatically recognizes various column name formats:

- **Post ID:** `id`, `post_id`, `postId`, `post_Id`
- **Caption:** `caption`, `post_text`, `text`, `description`, `content`
- **Likes:** `likes`, `likes_count`, `likesCount`, `like_count`
- **Comments:** `comments_count`, `commentsCount`, `comment_count`, `comments`
- **Shares:** `shares`, `shares_count`, `sharesCount`, `share_count`
- **Timestamp:** `date`, `timestamp`, `created_at`, `createdAt`, `posted_at`, `time`

## How to Use

1. Navigate to your dashboard
2. Click "Update Data" button
3. Select one of the CSV files from this folder
4. Choose "Append" or "Overwrite" mode
5. Upload and see your analytics!

## Notes

- All timestamps are in ISO 8601 format
- The system automatically detects sentiment and emotions from captions
- Hashtags are automatically extracted for hashtag intelligence
- Engagement scores are calculated automatically (likes + comments + shares)
