import mongoose, { isValidObjectId } from "mongoose"
import { Comment } from "../models/comment.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video.")
    }
    const comments = await Comment.aggregate([
        {
            $match : {
                video : new mongoose.Types.ObjectId(videoId),
            }
        },
        {
            $skip : (page - 1) * limit,
        },
        {
            $limit : limit,
        }
    ]);

    if (!comments) {
        throw new ApiError(400, "No comment found.")
    }

    return res.status(200).json(new ApiResponse(200, comments, "comments fetched successfully."))

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { content } = req.body;
    const { videoId } = req.params;
    const userId = req.user?._id;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video.")
    }
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid Video.")
    }
    if(!content)
    {
        throw new ApiError(404 , "No comment given.")
    }

    const comment = await Comment.create({
        video : videoId,
        owner : userId,
        content
    })

    if(!comment)
    {
        throw new ApiError(500 , "something went wrong while adding comment")
    }

    return res.status(200).json(new ApiResponse(200 , comment , "Comment added successfully."))

})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment

    const {commentId} = req.params;
    const owner = req.user?._id;
    const {content} = req.body;
    if (!isValidObjectId(commentId) || !isValidObjectId(owner)) {
        throw new ApiError(400, "Invalid Request.")
    }

    if(!content)
    {
        throw new ApiError(403 , "New comment not found.")
    }

    const comment = await Comment.findById(commentId);
    if(owner.toString() !== comment.owner.toString())
    {
        throw new ApiError(403 , "Unauthorized request.")
    }
    const updatedComment = await Comment.findByIdAndUpdate(commentId , {$set : {content}}, {new : true})

    if(!updatedComment)
    {
        throw new ApiError(500 , "Something went wrong while updating comment")
    }

    return res.status(200).json(new ApiResponse(200 , updatedComment , "Comment updated successfully."))

})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const commentId = req.params;

    if(!isValidObjectId(commentId))
    {
        throw new ApiError(404 , "Comment not found to be deleted.")
    }

    const deletedComment = await Comment.findByIdAndDelete(commentId);

    if(!deletedComment)
    {
        throw new ApiError(403 , "Comment cannot be deleted.")
    }

    return res.status(200).json(new ApiResponse(200 , {deletedComment} , "Comment deleted successfully."))


})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}
