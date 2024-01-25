import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {Video} from "../models/video.model.js"
import {Comment} from "../models/comment.model.js"
import {Tweet} from "../models/tweet.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    //TODO: toggle like on video
    const {videoId} = req.params
    const userId = req.user?._id;

    if(!isValidObjectId(videoId))
    {
        throw new ApiError(401 , "Valid Parameter Required.")
    }

    if(!isValidObjectId(userId))
    {
        throw new ApiError(402 , "User not authenticated.")
    }

    const likedVideo = await Like.aggregate([
        {
            $match : {
                likedBy : mongoose.Types.ObjectId(userId),
            }
        },
        {
            $match : {
                video : mongoose.Types.ObjectId(videoId)
            }
        }
    ])

    if(!likedVideo)
    {
        //Video not liked therefore need to like the video

        const video = await Video.findById(videoId)
        if(!video)
        {
            throw new ApiError(404 , "No video found.")
        }
        const newLike = await Like.create({
            video : videoId,
            likedBy : userId,
        })
        await newLike.save()

        if(!newLike)
        {
            throw new ApiError(500 , "Some error occured while liking video.")
        }

        return res.status(200).json(new ApiResponse(200 , newLike , "Video liked."))
    }
    //unlike video
    await Like.deleteOne({video : videoId , likedBy : userId} , function(err){
        if(err)
        {
            throw new ApiError(500 , "some error occured while unliking video.")
        }
    })

    return res.status(200).json(new ApiResponse(200 , {} , "Video Unliked"));
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    //TODO: toggle like on comment
    const {commentId} = req.params
    const userId = req.user?._id

    if(!isValidObjectId(commentId))
    {
        throw new ApiError(401 , "Valid Parameter Required.")
    }

    if(!isValidObjectId(userId))
    {
        throw new ApiError(402 , "User not authenticated.")
    }

    const liked = await Like.aggregate([
        {
            $match : {likedBy : mongoose.Types.ObjectId(userId)}
        },
        {
            $match : {comment : mongoose.Types.ObjectId(commentId)}
        }
    ])

    if(!liked)
    {
        const commentExist = await Comment.find({_id : commentId})
        if(!commentExist)
        {
            throw new ApiError(404 , "Comment not found")
        }

        const newLike = await Like.create({
            likedBy : userId,
            comment : commentId,
        })

        await newLike.save()

        if(!newLike)
        {
            throw new ApiError(500 , "some error occured while liking comment.")
        }

        return res.status(200).json(new ApiResponse(200 , newLike , "Comment Liked"));       
    }

    //unliking comment
    await Like.deleteOne({comment : commentId , likedBy : userId} , function(err){
        if(err)
        {
            throw new ApiError(500 , "some error occured while unliking comment.")
        }
    })

    return res.status(200).json(new ApiResponse(200 , {} , "Comment Unliked"));

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    //TODO: toggle like on tweet
    const {tweetId} = req.params
    const userId = req.user?._id

    if(!isValidObjectId(tweetId))
    {
        throw new ApiError(401 , "Valid Parameter Required.")
    }

    if(!isValidObjectId(userId))
    {
        throw new ApiError(402 , "User not authenticated.")
    }
    const liked = await Like.aggregate([
        {
            $match : {likedBy : mongoose.Types.ObjectId(userId)}
        },
        {
            $match : {tweet : mongoose.Types.ObjectId(tweetId)}
        }
    ])

    if(!liked)
    {
        const tweetExist = await Tweet.find({_id : tweetId})
        if(!tweetExist)
        {
            throw new ApiError(404 , "Tweet not found")
        }

        const newLike = await Like.create({
            likedBy : userId,
            tweet : tweetId,
        })

        await newLike.save()

        if(!newLike)
        {
            throw new ApiError(500 , "some error occured while liking tweet.")
        }

        return res.status(200).json(new ApiResponse(200 , newLike , "Tweet Liked"));       
    }

    //unliking comment
    await Like.deleteOne({comment : commentId , likedBy : userId} , function(err){
        if(err)
        {
            throw new ApiError(500 , "some error occured while unliking tweet.")
        }
    })

    return res.status(200).json(new ApiResponse(200 , {} , "Tweet Unliked"));

}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

    const userId = req.user?._id;
    if(!isValidObjectId(userId))
    {
        throw new ApiError(400 , "Unauthenticated User.")
    }

    const likedVideos = await Like.aggregate([
        {
            $match : {likedBy : mongoose.Types.ObjectId(userId)}
        },
        {
           $match : {
            comment : "",
            tweet : ""
           }
        }
    ])

    if(!likedVideos)
    {
        throw new ApiError(404 , "No videos liked")
    }

    return res.status(200).json(new ApiResponse(200 , likedVideos , "Liked Videos fetched successfully."))

})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}