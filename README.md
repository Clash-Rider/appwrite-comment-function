# 📝 Appwrite Comment Function

This serverless function allows authenticated users to add comments to posts using [Appwrite](https://appwrite.io/). It checks the validity of the request, ensures the post exists, and stores the comment in the database.

---

## 🌐 Endpoint

This function is designed to be used as a POST request in a serverless environment with Appwrite.

---

## 🛠 Environment Variables

Make sure these environment variables are set in your Appwrite function settings:

| Variable Name                    | Description                                  |
|----------------------------------|----------------------------------------------|
| `APPWRITE_FUNCTION_API_ENDPOINT` | Your Appwrite API endpoint (e.g. `https://cloud.appwrite.io/v1`) |
| `APPWRITE_FUNCTION_PROJECT_ID`   | Your Appwrite Project ID                     |
| `DATABASE_ID`                    | ID of the target Appwrite database           |
| `POST_COLLECTION_ID`             | Collection ID where posts are stored         |
| `COMMENT_COLLECTION_ID`          | Collection ID where comments should be stored|

---

## 🔐 Required Headers

| Header                  | Description                       |
|--------------------------|-----------------------------------|
| `x-appwrite-key`         | Appwrite API key with proper permissions |
| `x-appwrite-user-id`     | The ID of the currently authenticated user |

---

## 📦 Request

- **Method:** `POST`
- **Content-Type:** `application/json`
- **Body Example:**

```json
{
  "postId": "example-post-id",
  "commentId": "optional-comment-id",
  "content": "This is a comment."
}

Success Response
json
Copy
Edit
{
  "success": true,
  "commentAdded": {
    "commentId": "comment-id-or-null",
    "postId": "example-post-id",
    "authorId": "user-id",
    "content": "This is a comment."
  }
}


Error Responses
400 Bad Request

Missing required fields (postId, content, or authorId)

404 Not Found

Post with provided postId does not exist

405 Method Not Allowed

Request method is not POST

502 Bad Gateway

Failed to create comment document

500 Internal Server Error

Unexpected server error