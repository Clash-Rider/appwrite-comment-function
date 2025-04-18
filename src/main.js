import { Client, Users, Databases, Query } from 'node-appwrite';


const appwriteDatabaseId = process.env.DATABASE_ID;
const appwritePostCollectionId = process.env.POST_COLLECTION_ID;
const appwriteCommentCollectionId = process.env.COMMENT_COLLECTION_ID;
const appwriteFunctionApiEndpoint = process.env.APPWRITE_FUNCTION_API_ENDPOINT
const appwriteFunctionProjectId = process.env.APPWRITE_FUNCTION_PROJECT_ID
const appwriteheaderApiKey = req.headers['x-appwrite-key'] ?? ''

export default async function main({ req, res, context }) {

  const client = new Client()
    .setEndpoint(appwriteFunctionApiEndpoint)
    .setProject(appwriteFunctionProjectId)
    .setKey(appwriteheaderApiKey);

  const users = new Users(client);
  const databases = new Databases(client);

  try {

    if (req.method !== 'POST') {
      return res.status(405).json({ success: false, error: 'Method Not Allowed. Only POST requests are accepted.' });
    }

    const rawBody = req.body;
    let body = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;
    const { postId, commentId, content } = body;  //extract the body

    const authorId = req.headers['x-appwrite-user-id']; // extract user id sefly

    if (!authorId || !postId || !content) {
      return res.status(400).json({ success: false, error: 'Missing fild!, if you thing somthing is wrong please report' });
    }

    const existingPost = await databases.listDocuments(appwriteDatabaseId, appwritePostCollectionId, [
      Query.equal('$id', postId),
    ]);

    if (existingPost.total == 0) {
      return res.status(404).json({ success: false, error: 'Post not found in database, if you thing somthing is wrong please report' });
    }

    try {
      await databases.createDocument(appwriteDatabaseId, appwriteCommentCollectionId, 'unique()', {
        commentId: commentId || null,
        postId: postId,
        authorId: authorId,
        content: content,
      });
    } catch (error) {
      return res.status(502).json({ success: false, error: "fail to update collection" })
    }

    return res.status(200).json({
      success: true, commentAdded: {
        'commentId': commentId || null,
        'postId': postId,
        'authorId': authorId,
        'content': content,
      }
    })

  } catch (error) {
    return res.status(500).json({ success: false, error: error.message })
  }
}