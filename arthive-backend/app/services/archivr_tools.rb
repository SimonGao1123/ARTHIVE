module ArchivrTools
    # TODO ADD MORE
    TOOLS = [
        SearchReviewsForCurrentMedia
    ].freeze

    SCHEMAS = TOOLS.map{|t| t::SCHEMA}.freeze
    BY_NAME = TOOLS.index_by{|t| t::NAME}.freeze

    def self.execute(name, args, context)
        tool = BY_NAME[name]
        return {error: "Invalid tool name: #{name}"} unless tool

        return tool.execute(args, context)
    rescue StandardError => e
        Rails.logger.error "[ArchivrTools] Error executing tool #{name}: #{e.message}"
        {error: "Error executing tool #{name}: #{e.message}"}
    end
end