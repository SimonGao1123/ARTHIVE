class MediaUploadController < ApplicationController
    skip_before_action :verify_authenticity_token
    before_action :validate_user
    
    def validate_user
        auth_header = request.headers['Authorization']
        token = auth_header&.split(" ")&.last

        token = nil if token.blank?
        @current_user = nil

        if token
            begin
                payload = JsonWebToken.decode(token)
                @current_user = User.find_by(id: payload['user_id'])
            rescue JWT::ExpiredSignature
                render json: { error: "UNAUTHENTICATED", message: "Token has expired" }, status: :unauthorized
                return
            rescue JWT::DecodeError
                render json: { error: "UNAUTHENTICATED", message: "Invalid token" }, status: :unauthorized
                return
            end
        end

        if @current_user.nil?
            render json: { error: "UNAUTHENTICATED", message: "Not authenticated" }, status: :unauthorized
            return
        end
    end

    def create_media
        media = Media.new(media_params)
        media.user = @current_user # attach the user to the media

        if media.save
            # return the media object with the cover image url
            render json: { media: media, message: "Media created successfully", cover_image: media.cover_image }, status: :created
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
