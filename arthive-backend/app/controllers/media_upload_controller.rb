# DEPRICATED!!! USE THE MUTATION INSTEAD
class MediaUploadController < ApplicationController
    skip_before_action :verify_authenticity_token
    include JwtAuthenticatable

    def create_media
        media = Media.new(media_params)
        media.user = @current_user # attach the user to the media

        if media.save
            # return the media object with the cover image url
            render json: { media: media, message: "Media created successfully", cover_image: media.presigned_cover_image_url }, status: :created
        else
            render json: { error: "UNPROCESSABLE_ENTITY", message: media.errors.full_messages }, status: :unprocessable_entity
        end
    end

    private

    def media_params
        params.permit(:title, :creator, :year, :content_type, :ongoing,
                      :language, :summary, :page_count, :series_title, :organization, :cover_image,
                      genre: [], actors: [])
    end
end
