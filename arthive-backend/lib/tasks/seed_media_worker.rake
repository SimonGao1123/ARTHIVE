require "open-uri"

namespace :seed_media_worker do
    desc "Seed Media + Community from one scraper JSON file or a directory of them. Usage: rake 'seed_media_worker:run[../media-scraper/data]'"
    task :run, [:path] => :environment do |_, args|
        path = args.path
        if path.blank?
            abort "usage: bundle exec rake 'seed_media_worker:run[<path-to-json-or-dir>]'"
        end

        files = File.directory?(path) ? Dir.glob(File.join(path, "*.json")).sort : [path]
        if files.empty?
            abort "no JSON files at #{path}"
        end

        owner = User.find_by(if_admin: true)
        abort "no admin user found — make one first" if owner.nil?

        created = skipped = failed = 0

        files.each do |file|
            rows = JSON.parse(File.read(file))
            puts "\n→ #{file} (#{rows.size} rows)"

            rows.each do |row|
                title = row["title"].to_s.strip
                content_type = row["content_type"]

                # Dedup against title + content_type. Same film name across film/series
                # is rare-but-possible, so content_type prevents that collision.
                if title.blank? || content_type.blank?
                    failed += 1
                    puts "  ✗ missing title or content_type: #{row.inspect[0, 80]}"
                    next
                end
                if Media.exists?(title: title, content_type: content_type)
                    skipped += 1
                    next
                end

                # Normalize genres: lowercase, trim, drop blanks. Fall back to
                # ["uncategorized"] so the presence validation passes.
                normalized_genres = (row["genre"] || [])
                    .map { |g| g.to_s.downcase.strip }
                    .reject(&:blank?)
                    .uniq
                normalized_genres = ["uncategorized"] if normalized_genres.empty?

                begin
                    media = nil
                    ActiveRecord::Base.transaction do
                        media = Media.create!(
                            title: title,
                            creator: row["creator"].presence || "Unknown",
                            year: row["year"].to_s.presence || "Unknown",
                            content_type: content_type,
                            language: row["language"].presence || "en",
                            summary: row["summary"].presence || "—",
                            genre: normalized_genres,
                            ongoing: row["ongoing"] == true,
                            actors: row["actors"],
                            page_count: row["page_count"],
                            series_title: row["series_title"],
                            organization: row["organization"],
                            user: owner,
                        )
                        Community.create!(media: media)
                    end

                    # Cover attach is best-effort — a dead URL shouldn't roll back the row.
                    attach_cover(media, row["cover_url"]) if row["cover_url"].present?

                    created += 1
                    puts "  ✓ #{content_type}: #{title}"
                rescue => e
                    failed += 1
                    puts "  ✗ #{title}: #{e.class}: #{e.message}"
                end
            end
        end

        puts "\nDone: #{created} created, #{skipped} skipped, #{failed} failed"
    end

    def attach_cover(media, url)
        io = URI.open(url, read_timeout: 15, open_timeout: 10)
        filename = File.basename(URI.parse(url).path).presence || "cover.jpg"
        media.cover_image.attach(io: io, filename: filename)
    rescue => e
        puts "    (cover failed for #{media.title}: #{e.class}: #{e.message})"
    end
end
