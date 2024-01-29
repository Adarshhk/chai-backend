import mongoose, { isValidObjectId, trusted } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination

    const sortOptions = {};

    if (sortBy) {
        sortOptions[sortBy] = sortType === 'desc' ? -1 : 1;
    }

    const videos = await Video.aggregate([
        {
            $match: {

                $or: [{ title: { $regex: query, $options: "i" } }, { description: { $regex: query, $options: "i" } }],
                owner: new mongoose.Types.ObjectId(userId)

            }
        },
        {
            $sort: sortOptions,
        },
        {
            $skip: (page - 1) * limit,
        },
        {
            $limit: paresInt(limit),
        }
    ])

    if (!videos) {
        throw new ApiError(500, "Cannot fetch videos.")
    }

    return res.status(200).json(new ApiResponse(200, videos, "videos fetched successfully."))

})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    // TODO: get video, upload to cloudinary, create video
    if (title.trim() === "") {
        throw new ApiError(401, "No title given.")
    }

    const user = req.user?._id;

    if (!req.files.videoFile || !req.files.thumbnail) {
        throw new ApiError(401, "Video file or thumbnail not found.")
    }

    const video = await uploadOnCloudinary(req.files?.videoFile[0].path)
    const thumbnail = await uploadOnCloudinary(req.files?.thumbnail[0].path)

    if (!video || !thumbnail) {
        throw new ApiError(500, "Error while uploading video.")
    }
    console.log(video);
    console.log(thumbnail);
    const videoModel = await Video.create({
        title,
        duration: video.duration,
        videoFile: video.url,
        thumbnail: thumbnail.url,
        description,
        owner: user,
        cloudinaryVideoId: video.public_id,
        cloudinaryThumbnailId: thumbnail.public_id,
    })

    if (!videoModel) {
        throw new ApiError(500, "Error while uploading video.")
    }

    return res.status(200).json(new ApiResponse(200, videoModel, "video uploaded successfully."))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if (!isValidObjectId(videoId)) {
        throw new ApiError(401, "Not valid video id.")
    }
    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(500, "Some error occured while finding video.")
    }

    return res.status(200).json(new ApiResponse(200, video, "Video found successfully."))

})

const updateVideo = asyncHandler(async (req, res) => {

    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    const { title, description } = req.body;
    const user = req.user?._id;

    const video = await Video.findById(videoId);


    if (video.owner.toString() !== user.toString()) {
        throw new ApiError(401, "Unauthorized person cant update video.")
    }

    const thumbnailLocalPath = req.file?.path;
    if (!thumbnailLocalPath) {
        throw new ApiError(404, "Thumbnail file not found.")
    }

    console.log(video)
    const deleteThumbnail = await deleteFromCloudinary(video.cloudinaryThumbnailId);
    if (!deleteThumbnail) {
        throw new ApiError(500, "Cannot delete old thumbnail while updating thumbnail.")
    }
    const thumbnail = uploadOnCloudinary(thumbnailLocalPath);

    const updatedVideo = await Video.findByIdAndUpdate(videoId,
        {
            $set: {
                title,
                description,
                thumbnail: thumbnail.url,
                cloudinaryThumbnailId: thumbnail.public_id,
            },
        },
        {
            new: true,
        }
    )

    if (!updateVideo) {
        throw new ApiError(500, "Some error while updating video details.")
    }

    return res.status(200).json(new ApiResponse(200, updatedVideo, "Video details updated successfully."))
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if (!isValidObjectId(videoId)) {
        throw new ApiError(401, "Invalid parameter while deleting video.")
    }

    const user = req.user?._id;
    const video = await Video.findById(videoId);

    if (user.toString() !== video.owner.toString()) {
        throw new ApiError(402, "Unauthorized user trying to delete video.")
    }

    try {
        const deleteThumbnail = await deleteFromCloudinary(video.cloudinaryThumbnailId)
        const deletedVideoFromCloud = await deleteFromCloudinary(video.cloudinaryVideoId)
        const deletedVideo = await Video.findByIdAndDelete(videoId);
    } catch (error) {
        throw new ApiError(500, "some error occured while deleting video.")
    }

    return res.status(200).json(new ApiResponse(200, {}, "Video deleted Successfully."))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(401, "Invalid parameter while changing video status.")
    }

    const user = req.user?._id;
    const video = await Video.findById(videoId);

    if (user.toString() !== video.owner.toString()) {
        throw new ApiError(402, "Unauthorized user trying to change video status.")
    }

    const updateVideoStatus = await Video.findByIdAndUpdate(videoId,
        {
            $set: {
                isPublished: true ? false : true,
            }
        },
        {
            new: true,
        })

    if (!updateVideoStatus) {
        throw new ApiError(500, "Error occured while updating video status.")
    }

    return res.status(200).json(new ApiResponse(200, updateVideoStatus, "Video status updated."))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
