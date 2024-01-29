import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    // TODO: toggle subscription
    const userId = req.user?._id;
    if (!isValidObjectId(channelId) || !isValidObjectId(userId)) {
        throw new ApiError(401, "Unauthorized request while subscribing.")
    }

    const subCheck = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId),
            }
        },
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(userId),
            }
        }
    ])

    if (subCheck) {
        const unSub = await Subscription.findByIdAndDelete(subCheck._id)
        if (!unSub) {
            throw new ApiError(505, "Unable to unsubscribe.")
        }
        return res.status(200).json(new ApiResponse(200, unSub, "Unsubscribed"))
    }

    const sub = await Subscription.create({
        subscriber: userId,
        channel: channelId,
    })

    if (!sub) {
        throw new ApiError(505, "Unable to subscribe.")
    }
    return res.status(200).json(new ApiResponse(200, sub, "subscribed"))

})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    const userId = req.user?._id;
    if(channelId.toString() !== userId.toString())
    {
        throw new ApiError(401 , "Unauthorized person requesting subscriber list.")
    }

    const subscribers = await Subscription.aggregate([
        {
            $match : {channel : channelId}
        },
        {
            $project : "$subscriber"
        }
    ])

    if(!subscribers)
    {
        throw new ApiError(401 , "No subscriber found.")
    }
    return res.status(200).json(new ApiResponse(200 , subscribers , "Subscribers fetched successfully."))

})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if(!isValidObjectId(subscriberId))
    {
        throw new ApiError(401 , "Invalid subscriber ID")
    }

    const channels = await Subscription.find({subscriber : subscriberId});
    if(!channels)
    {
        throw new ApiError(401 , "No subscribed channel found.")
    }
    return res.status(200).json(new ApiResponse(200 , channels , "Channels Found."))

})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}