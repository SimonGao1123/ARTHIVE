require 'jwt'

DEFAULT_EXPIRATION = 15.minutes
TEST_EXPIRATION = 10.seconds

class JsonWebToken
  SECRET_KEY = Rails.application.secret_key_base

  def self.encode(payload, exp: TEST_EXPIRATION.from_now)
    payload[:exp] = exp.to_i
    JWT.encode(payload, SECRET_KEY, 'HS256')
  end

  def self.decode(token)
    decoded = JWT.decode(token, SECRET_KEY, true, { algorithm: 'HS256' })
    # payload has [body, header]
    HashWithIndifferentAccess.new(decoded[0])
  end
end