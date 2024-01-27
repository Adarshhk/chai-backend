import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    if(title.trim() === "")
    {
        throw new ApiError(401 , "No title given.")
    }

    const user = req.user?._id;

    if(!req.files.videoFile || !req.files.thumbnail)
    {
        throw new ApiError(401 , "Video file or thumbnail not found.")
    }

    const video = await uploadOnCloudinary(req.files?.videoFile[0].path)
    const thumbnail = await uploadOnCloudinary(req.files?.thumbnail[0].path)
    
    if(!video || !thumbnail)
    {
        throw new ApiError(500 , "Error while uploading video.")
    }

    const videoModel = await Video.create({
        duration : video.duration,
        videoFile : video.url,
        thumbnail : thumbnail.url,
        description,
        views : 0,
        owner : user
    })

    if(!videoModel)
    {
        throw new ApiError(500 , "Error while uploading video.")
    }

    return res.status(200).json(new ApiResponse(200 , videoModel , "video uploaded successfully."))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if(!isValidObjectId(videoId))
    {
        throw new ApiError(401 , "Not valid video id.")
    }
    const video = await Video.findById(videoId);

    if(!video)
    {
        throw new ApiError(500 , "Some error occured while finding video.")
    }

    return res.status(200).json(new ApiResponse(200 , video , "Video found successfully."))

})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    const {title , description , thumbnail} = req.body;
    const user = req.user?._id;
    const video = await Video.findById(videoId);

    if(video.owner.toString !== user.toString())
    {
        throw new ApiError(401 , "Unauthorized person cant update video.")
    }

    await Video.findb

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
