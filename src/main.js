import { Client, Users, Databases, Query } from 'node-appwrite';

const appwriteDatabaseId = process.env.DATABASE_ID;
const appwritePostCollectionId = process.env.POST_COLLECTION_ID;
const appwriteCommentCollectionId = process.env.COMMENT_COLLECTION_ID;
const appwriteFunctionApiEndpoint = process.env.APPWRITE_FUNCTION_API_ENDPOINT;
const appwriteFunctionProjectId = process.env.APPWRITE_FUNCTION_PROJECT_ID;

export default async function main({ req, res, context }) {
  try {
    if (req.method !== 'POST') {
      return res.json({
        success: false,
        error: 'Method Not Allowed. Only POST requests are accepted.'
      });
    }

    const appwriteHeaderApiKey = req.headers['x-appwrite-key'] || '';
    const authorId = req.headers['x-appwrite-user-id'];

    let body;
    try {
      const rawBody = req.body;
      body = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;
    } catch (err) {
      return res.json({ success: false, error: 'Invalid JSON body.' });
    }

    const { postId, commentId = null, content } = body;

    if (!authorId || !postId || !content) {
      return res.json({
        success: false,
        error: 'Missing field: authorId, postId, and content are required.'
      });
    }

    const client = new Client()
      .setEndpoint(appwriteFunctionApiEndpoint)
      .setProject(appwriteFunctionProjectId)
      .setKey(appwriteHeaderApiKey);

    const databases = new Databases(client);

    context.log("Fetching post with ID:", postId);
    const existingPostResponse = await databases.listDocuments(
      appwriteDatabaseId,
      appwritePostCollectionId,
      [Query.equal('$id', postId)]
    );

    if (existingPostResponse.total === 0) {
      return res.json({
        success: false,
        error: 'Post not found.'
      });
    }

    const existingPost = existingPostResponse.documents[0];

    context.log("Creating new comment:", { commentId, postId, authorId, content });
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

    await new Promise(resolve => setTimeout(resolve, 300));

    context.log("Fetching top-level comments for post:", postId);
    const updatedComments = await databases.listDocuments(
      appwriteDatabaseId,
      appwriteCommentCollectionId,
      [
        Query.equal('postId', postId),
        Query.equal('commentId', null)
      ]
    );

    context.log("Top-level comments count:", updatedComments.total);
    context.log("Sample comment document:", updatedComments.documents[0]);

    await databases.updateDocument(
      appwriteDatabaseId,
      appwritePostCollectionId,
      postId,
      {
        commentsCount: updatedComments.total
      }
    );

    return res.json({
      success: true,
      commentAdded: created,
      commentsCount: updatedComments.total
    });
  } catch (error) {
    context.log("Error occurred:", error);
    return res.json({ success: false, error: error.message || 'Unknown error' });
  }
}