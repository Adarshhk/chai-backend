import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const { content } = req.body;
    if (!content || !content?.trim()) {
        throw new ApiError(401, "No tweet written.")
    }

    const owner = await User.findById(req.user?._id)
    if (!owner) {
        throw new ApiError(403, "Unauthorized User Cannot Tweet.")
    }

    const tweet = await Tweet.create({
        content, owner: owner._id,
    })

    return res.status(200).json(new ApiResponse(200, tweet , "Tweeted Successfully."))
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {userId} = req.params;
    if(!isValidObjectId(userId))
    {
        throw new ApiError(401 , "Valid parameter not given.")
    }

    const tweets = await Tweet.aggregate([
        {
            $match : {
                owner : mongoose.Types.ObjectId(userId),
            }
        }
    ])

    if(!tweets)
    {
        throw new ApiError(401 , "No tweets found.")
    }

    return res.status(200).json(new ApiResponse(200 , tweets , "Tweets fetched successfully."))
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId} = req.params;
    const {newContent} = req.body;
    if(!isValidObjectId(tweetId))
    {
        throw new ApiError(401 , "Invalid URL request.")
    }
    if(!newContent || !newContent?.trim())
    {
        throw new ApiError(401 , "Provide updated tweet.")
    }

    const tweet = await Tweet.findById(tweetId)
    if(!tweet)
    {
        throw new ApiError(401 , "No user Found.")
    }

    if(req.user._id.toString() !== tweet.owner.toString())
    {
        throw new ApiError(401 , "You dont have the permission to change this tweet.")
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(tweetId , {
      $set :  { content : newContent}
    } , {new : true});

    if(!updatedTweet)
    {
        throw new ApiError(402 , "No tweet found.")
    }

    return res.status(200).json(new ApiResponse(200 , updatedTweet , "Tweet updated successfully."))
    

})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet

    const {tweetId} = req.params;

    if(!isValidObjectId(tweetId))
    {
        throw new ApiError(401 , "Valid Parameter not given")
    }

    const tweet = await Tweet.findById(tweetId);

    if(!tweet)
    {
        throw new ApiError(403 , "No tweet found.")
    }

    if(tweet.owner.toString() !== req.user._id.toString())
    {
        throw new ApiError(401 , "You dont have the permission to delete this tweet.")
    }

    const deletedTweet = await Tweet.findByIdAndDelete(tweetId);
    if(!deletedTweet)
    {
        throw new ApiError(403 , "Some error occured while deleting the tweet.")
    }

    return res.status(200).json(new ApiResponse(200 , deletedTweet , "Tweet Deleted Successfully."))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
