import { Client, Users, Databases, Query } from 'node-appwrite';

const appwriteDatabaseId = process.env.DATABASE_ID;
const appwritePostCollectionId = process.env.POST_COLLECTION_ID;
const appwriteCommentCollectionId = process.env.COMMENT_COLLECTION_ID;
const appwriteFunctionApiEndpoint = process.env.APPWRITE_FUNCTION_API_ENDPOINT;
const appwriteFunctionProjectId = process.env.APPWRITE_FUNCTION_PROJECT_ID;

export default async function main({ req, res, context }) {
  // Ensure only POST requests
  if (req.method !== 'POST') {
    return res.json({
      success: false,
      error: 'Method Not Allowed. Only POST requests are accepted.'
    });
  }

  // Extract dynamic API key and user ID from headers
  const appwriteHeaderApiKey = req.headers['x-appwrite-key'] || '';
  const authorId = req.headers['x-appwrite-user-id'];

  // Parse JSON body safely
  let body;
  try {
    const rawBody = req.body;
    body = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;
  } catch (err) {
    return res.json({ success: false, error: 'Invalid JSON body.' });
  }

  const { postId, commentId = null, content } = body;

  // Validate required fields
  if (!authorId || !postId || !content) {
    return res.json({
      success: false,
      error: 'Missing field: authorId, postId, and content are required.'
    });
  }

  // Initialize Appwrite SDK
  const client = new Client()
    .setEndpoint(appwriteFunctionApiEndpoint)
    .setProject(appwriteFunctionProjectId)
    .setKey(appwriteHeaderApiKey);

  const databases = new Databases(client);

  try {
    // Verify that the post exists
    const existingPost = await databases.listDocuments(
      appwriteDatabaseId,
      appwritePostCollectionId,
      [Query.equal('$id', postId)]
    );

    if (existingPost.total === 0) {
      return res.json({
        success: false,
        error: 'Post not found.'
      });
    }

    // Create the comment
    const created = await databases.createDocument(
      appwriteDatabaseId,
      appwriteCommentCollectionId,
      'unique()',
      {
        commentId,
        postId,
        authorId,
        content,
      }
    );

    return res.json({
      success: true,
      commentAdded: created,
    });
  } catch (error) {
    console.error('Error executing function:', error);
    return res.json({ success: false, error: error.message });
  }
}