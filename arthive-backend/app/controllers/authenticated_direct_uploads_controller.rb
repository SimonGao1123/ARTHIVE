class AuthenticatedDirectUploadsController < ActiveStorage::DirectUploadsController
    skip_before_action :verify_authenticity_token
    include JwtAuthenticatable
end