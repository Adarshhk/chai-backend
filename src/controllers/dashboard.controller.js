import mongoose, { mongo } from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    
    const userId = req.user?._id;

    const videoData = await Video.aggregate([
        {
            $match : {
                owner : new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup : {
                from : "likes",
                localField : "_id",
                foreignField : "video",
                as : "likes"
            }
        },
        {
            $addFields : {
                likes : {
                    $size : {$ifNull : ["$likes" , []]}
                }
            }
        },
        {
            $lookup : {
                from : "subscriptions",
                localField : "owner",
                foreignField : "channel",
                as : "subscribers",
            }
        },
        {
            $addFields : {
                subscribers : {
                    $size : {$ifNull : ["$subscribers" , []]}
                }
            }
        },
        {
            $group : {
                _id : null,
                totalViews : {$sum : "$views"},
                totalSubscribers : "$subscribers",
                totalLikes : {$sum : "$likes"},
            }
        },
        {
            $project : {
                owner : 0,
                _id : 0,
            }
        }
    ])

    return res.status(200).json(new ApiResponse(200 , videoData , "channel stats fetched successfully."))

})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel

    const userId = req.user?._id;
    const Videos = await Video.find({owner : userId});

    return res.status(200).json(new ApiResponse(200 , Videos , "All videos fetched successfully."))
})

export {
    getChannelStats, 
    getChannelVideos
    }