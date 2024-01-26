import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body
    const userId = req.user?._id;

    if(name.trim() === "")
    {
        throw new ApiError(401 , "No content Given.")
    }

    const playlist = await Playlist.create({
        name, description, owner: userId,
    }, { new: true })

    if(!playlist)
    {
        throw new ApiError(500 , "Something went wrong while creating playlist.")
    }

    return res.status(200).json(new ApiResponse(200 , playlist , "playlist created."))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params
    //TODO: get user playlists
    const requestedBy = req.user?._id;

    if(requestedBy.toString() !== userId.toString())
    {
        throw new ApiError(401 , "Unauthorized person requesting playlist.")
    }

    if(!isValidObjectId(userId))
    {
        throw new ApiError(401 , "UserId not valid.")
    }

    const playlist = await Playlist.find({owner : userId})

    if(!playlist)
    {
        throw new ApiError(404 , "No playlist found.")
    }

    return res.status(200).json(new ApiResponse(200 , playlist , "Playlist fetched successfully."))

})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    //TODO: get playlist by id

    if(!isValidObjectId(playlistId))
    {
        throw new ApiError(401 , "Playlist Id not valid.")
    }

    const playlist = await Playlist.find({_id : playlistId})

    if(!playlist)
    {
        throw new ApiError(404 , "Playlist not Found.")
    }

    return res.status(200).json(new ApiResponse(200 , playlist , "Playlist fetched successfully."))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    //only owner can add videos to his playlist.

    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId))
    {
        throw new ApiError(403 , "Invalid Parameter given while adding video to playlist")
    }

    const playlist = await Playlist.findById(playlistId);
    const user = req.user?._id;
    if(user.toString() !== playlist.owner.toString())
    {
        throw new ApiError(401 , "Unauthorized user requesting video addition.")
    }

    const updatedPlaylist = await Playlist.updateOne({_id : playlistId} , {$push : {"videos" : videoId}} , {new : true})

    if(!updatedPlaylist)
    {
        throw new ApiError(500 , "Error while adding video to playlist.")
    }
    return res.status(200).json(new ApiResponse(200 , updatedPlaylist , "Playlist updated successfully."))
    
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    // TODO: remove video from playlist

    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId))
    {
        throw new ApiError(403 , "Invalid Parameter given while removing video from playlist")
    }

    const playlist = await Playlist.findById(playlistId);
    const user = req.user?._id;

    if(user.toString() !== playlist.owner.toString())
    {
        throw new ApiError(401 , "Unauthorized user requesting video deletion.")
    }

    const updatedPlaylist = await Playlist.updateOne({_id : playlistId} , {$pull : {"videos" : videoId}} , {new : true})

    if(!updatedPlaylist)
    {
        throw new ApiError(500 , "Error while adding video to playlist.")
    }
    return res.status(200).json(new ApiResponse(200 , {} , "Playlist updated successfully."))

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    // TODO: delete playlist

    if(!isValidObjectId(playlistId))
    {
        throw new ApiError(403 , "Invalid playlist Id to delete playlist.")
    }

    const user = req.user?._id;
    const playlist = await Playlist.findById(playlistId);
    if(user.toString() !== playlist.owner.toString())
    {
        throw new ApiError(401 , "Unauthorized user requesting playlist deletion.")
    }

    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId)

    if(!deletedPlaylist)
    {
        throw new ApiError(500 , "some error occured while deleting playlist.")
    }

    return res.status(200).json(new ApiResponse(200 , deletedPlaylist , "Playlist deleted successfully."))

})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body
    //TODO: update playlist

    if(!isValidObjectId(playlistId))
    {
        throw new ApiError(403 , "Invalid playlist Id to update playlist.")
    }

    if(name.trim() === "")
    {
        throw new ApiError(401 , "No content Given.")
    }

    const user = req.user?._id;
    const playlist = await Playlist.findById(playlistId);
    if(user.toString() !== playlist.owner.toString())
    {
        throw new ApiError(401 , "Unauthorized user requesting playlist updation.")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId , {$set : {name , description}} , {new :true})

    if(!updatedPlaylist)
    {
        throw new ApiError(500 , "Some error occured while updating playlist.")
    }

    return res.status(200).json(new ApiResponse(200 , updatedPlaylist , "Playlist updated successfully."))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
