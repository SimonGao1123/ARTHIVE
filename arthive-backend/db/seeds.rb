def attach_image(record, attachment_name, filename)
  ext = File.extname(filename).downcase
  mime = ext == ".png" ? "image/png" : "image/jpeg"
  record.public_send(attachment_name).attach(
    io: File.open(Rails.root.join("db/seed_images/#{filename}")),
    filename: filename,
    content_type: mime
  )
end

# ── Users ────────────────────────────────────────────────────────────────────

admin_user = User.create!(
  email: "test@test.com",
  username: "test",
  password: "12345678",
  if_admin: true,
  description: "Site administrator"
)
user1 = User.create!(email: "user@test.com",  username: "user",  password: "12345678", if_admin: false)
user2 = User.create!(email: "user2@test.com", username: "user2", password: "12345678", if_admin: false, visibility: "private")
user3 = User.create!(email: "user3@test.com", username: "user3", password: "12345678", if_admin: false, visibility: "private")

Follow.send_follow(admin_user.id, user1.id)
Follow.send_follow(admin_user.id, user2.id)
Follow.send_follow(admin_user.id, user3.id)
Follow.send_follow(user1.id, admin_user.id)
Follow.send_follow(user2.id, admin_user.id)
Follow.send_follow(user3.id, admin_user.id)
Follow.send_follow(user3.id, user2.id)
Follow.send_follow(user2.id, user3.id)

# ── Profile pictures ─────────────────────────────────────────────────────────

attach_image(user1, :profile_picture, "user1_pfp.jpeg")
attach_image(user2, :profile_picture, "smiley_user_pfp.png")

# ── Media ────────────────────────────────────────────────────────────────────

harry_potter = Media.create!(
  user: admin_user, title: "Harry Potter and the Sorcerer's Stone",
  creator: "J.K. Rowling", year: "1997", content_type: "book",
  language: "English", summary: "A young boy discovers he is a wizard and begins his education at Hogwarts School of Witchcraft and Wizardry.",
  genre: ["fantasy", "adventure"], ongoing: false, page_count: 309
)
attach_image(harry_potter, :cover_image, "harry_potter_book.jpg")

the_road = Media.create!(
  user: admin_user, title: "The Road",
  creator: "Cormac McCarthy", year: "2006", content_type: "book",
  language: "English", summary: "A father and son journey through a post-apocalyptic America, struggling to survive and hold onto their humanity.",
  genre: ["drama", "survival"], ongoing: false, page_count: 287
)
attach_image(the_road, :cover_image, "the_road_book.jpg")

total_recall = Media.create!(
  user: admin_user, title: "Total Recall",
  creator: "Paul Verhoeven", year: "1990", content_type: "film",
  language: "English", summary: "A construction worker discovers that his memories may be implants and travels to Mars to uncover his true identity.",
  genre: ["action", "science fiction"], ongoing: false,
  actors: ["Arnold Schwarzenegger", "Sharon Stone", "Rachel Ticotin"]
)
attach_image(total_recall, :cover_image, "total_recall_movie.jpeg")

gangwar = Media.create!(
  user: admin_user, title: "Gangwar",
  creator: "Vikram Bhatt", year: "1999", content_type: "film",
  language: "Hindi", summary: "A cop battles a ruthless crime lord in the gritty streets of Mumbai.",
  genre: ["action", "crime"], ongoing: false,
  actors: ["Govinda", "Revathi", "Arbaaz Khan"]
)
attach_image(gangwar, :cover_image, "gangwar_movie.jpeg")

brooklyn = Media.create!(
  user: admin_user, title: "Brooklyn Nine-Nine",
  creator: "Michael Schur", year: "2013", content_type: "series",
  language: "English", summary: "The detectives of a Brooklyn precinct navigate crime-solving and workplace antics under an unconventional captain.",
  genre: ["comedy", "crime"], ongoing: false
)
attach_image(brooklyn, :cover_image, "brooklyn_nine_nine_series.jpg")

riverdale = Media.create!(
  user: admin_user, title: "Riverdale",
  creator: "Roberto Aguirre-Sacasa", year: "2017", content_type: "series",
  language: "English", summary: "Archie and his friends uncover dark secrets lurking beneath the surface of their seemingly perfect small town.",
  genre: ["drama", "mystery"], ongoing: false
)
attach_image(riverdale, :cover_image, "riverdale_series.jpeg")

arcane = Media.create!(
  user: admin_user, title: "Arcane",
  creator: "Christian Linke & Alex Yee", year: "2021", content_type: "series",
  language: "English", summary: "Set in the world of League of Legends, two sisters find themselves on opposing sides of a brewing conflict.",
  genre: ["animation", "action"], ongoing: false
)
attach_image(arcane, :cover_image, "random_cover_series.jpg")

zelda = Media.create!(
  user: admin_user, title: "The Legend of Zelda: Breath of the Wild",
  creator: "Nintendo", year: "2017", content_type: "game",
  language: "English", summary: "Link awakens from a long slumber to a vast open world and must defeat Calamity Ganon to save Hyrule.",
  genre: ["action", "adventure"], ongoing: false
)
attach_image(zelda, :cover_image, "legend_of_zelda_game.jpg")

balatro = Media.create!(
  user: admin_user, title: "Balatro",
  creator: "LocalThunk", year: "2024", content_type: "game",
  language: "English", summary: "A hypnotic poker-based roguelike where you build increasingly absurd decks of jokers to beat ever-escalating blinds.",
  genre: ["comedy", "experimental"], ongoing: false
)
attach_image(balatro, :cover_image, "Balatro_cover_game.jpg")

all_media = [harry_potter, the_road, total_recall, gangwar, brooklyn, riverdale, arcane, zelda, balatro]

# ── Communities ───────────────────────────────────────────────────────────────

communities = all_media.each_with_object({}) do |m, h|
  h[m.id] = Community.create!(media: m)
end

# ── Reviews ───────────────────────────────────────────────────────────────────

r_u1_hp    = Review.create!(user: user1, media: harry_potter,  rating: 4.5, if_favorite: true,  if_finished: true,  content: "A timeless classic. The worldbuilding is unmatched and every chapter pulls you deeper in.")
r_u1_tr    = Review.create!(user: user1, media: total_recall,  rating: 3.5, if_favorite: false, if_finished: true,  content: "Great action sequences and a genuinely mind-bending premise. Holds up surprisingly well.")
r_u1_bk    = Review.create!(user: user1, media: brooklyn,      rating: 5.0, if_favorite: true,  if_finished: false, content: "Funniest show I've ever watched. Jake Peralta is an icon.")
r_u1_bal   = Review.create!(user: user1, media: balatro,       rating: 4.0, if_favorite: true,  if_finished: true,  content: "Dangerously addictive. I told myself one more run at midnight and woke up at 4am.")

r_u2_road  = Review.create!(user: user2, media: the_road,      rating: 5.0, if_favorite: true,  if_finished: true,  content: "Devastating and beautiful in equal measure. McCarthy writes like no one else.")
r_u2_gw    = Review.create!(user: user2, media: gangwar,       rating: 2.5, if_favorite: false, if_finished: true,  content: nil)
r_u2_rv    = Review.create!(user: user2, media: riverdale,     rating: 1.5, if_favorite: false, if_finished: false, content: "Lost the plot completely by season two. Could not continue.")

r_adm_tr   = Review.create!(user: admin_user, media: total_recall, rating: 4.0, if_favorite: true,  if_finished: true,  content: "Schwarzenegger at his absolute peak. Verhoeven's direction is delightfully unhinged.")
r_adm_hp   = Review.create!(user: admin_user, media: harry_potter,  rating: 5.0, if_favorite: true,  if_finished: true,  content: "Perfect for any age. The sense of wonder never fades on a reread.")
r_adm_zl   = Review.create!(user: admin_user, media: zelda,         rating: 5.0, if_favorite: true,  if_finished: true,  content: "Changed what open-world games can be. Every hill you climb reveals something new.")

r_u3_bal   = Review.create!(user: user3, media: balatro,  rating: 4.5, if_favorite: true,  if_finished: false, content: "One more hand. That's all. Just one more.")
r_u3_arc   = Review.create!(user: user3, media: arcane,   rating: 5.0, if_favorite: true,  if_finished: true,  content: "Visually stunning. Jinx's arc is one of the best character studies in any animated series.")

# ── Review Embeddings ─────────────────────────────────────────────────────────

Review.where.not(content: nil).each do |review|
  vector = EmbeddingService.embed(review.content)
  review.update_column(:embedding, vector) if vector
end

# ── Community Threads ─────────────────────────────────────────────────────────

# Harry Potter
hp_com = communities[harry_potter.id]
CommunityThread.create!(community: hp_com, user: user1, title: "Favourite book in the series?", content: "For me it has to be Prisoner of Azkaban — the time-travel twist is still brilliant.")
CommunityThread.create!(community: hp_com, user: admin_user, title: "Underrated characters", content: "Neville Longbottom deserves way more credit. His arc across the series is phenomenal.")

# The Road
road_com = communities[the_road.id]
CommunityThread.create!(community: road_com, user: user2, title: "The ending — hopeful or hopeless?", content: "I keep going back and forth. What do you all think McCarthy intended?")

# Total Recall — deep chain (depth 4)
tr_com = communities[total_recall.id]
tr_root = CommunityThread.create!(community: tr_com, user: user1, title: "Was it all a dream?", content: "Do you think Quaid actually went to Mars or was it the Rekall program the whole time?")
tr_r1   = CommunityThread.create!(community: tr_com, user: user2,       parent_thread: tr_root, root_thread: tr_root, content: "The blue sky at the end breaks the dream theory for me. Rekall wouldn't give him that.")
tr_r2   = CommunityThread.create!(community: tr_com, user: admin_user,  parent_thread: tr_r1,   root_thread: tr_root, content: "Unless the dream package included a twist ending specifically designed to feel real. The agency guy literally warns him about a blue sky moment.")
tr_r3   = CommunityThread.create!(community: tr_com, user: user3,       parent_thread: tr_r2,   root_thread: tr_root, content: "That detail always gets me. Verhoeven said he deliberately left it ambiguous. I think the blinking light right before the credits is the tell.")
CommunityThread.create!(community: tr_com, user: user1, title: "Best practical effect?", content: "The three-breasted woman was clearly the peak of 90s cinema technology.")

# Gangwar
gw_com = communities[gangwar.id]
CommunityThread.create!(community: gw_com, user: user2, title: "Govinda's best performance?", content: "I'd argue this is his most serious role. Really different from his comedy work.")

# Brooklyn Nine-Nine
bk_com = communities[brooklyn.id]
CommunityThread.create!(community: bk_com, user: user1, title: "Best cold open?", content: "The Halloween Heist episodes always have the best cold opens. Impossible to pick just one.")
CommunityThread.create!(community: bk_com, user: user3, title: "Most underrated character", content: "Gina Linetti. Controversial take but her chaos energy balanced the precinct perfectly.")

# Riverdale
rv_com = communities[riverdale.id]
CommunityThread.create!(community: rv_com, user: user2, title: "Where did it go wrong?", content: "Season 1 was genuinely good. Was it the Gargoyle King arc that killed it?")

# Arcane
arc_com = communities[arcane.id]
CommunityThread.create!(community: arc_com, user: user3, title: "Jinx vs Vi — who had the better arc?", content: "Jinx's descent is more dramatic but Vi's perspective grounds the whole story.")
CommunityThread.create!(community: arc_com, user: admin_user, title: "Animation style breakdown", content: "The painterly texture on every frame is wild. Fortiche basically invented a new visual language.")

# Zelda
zl_com = communities[zelda.id]
CommunityThread.create!(community: zl_com, user: admin_user, title: "Best shrine puzzle?", content: "Anything involving the Magnesis rune. Simple mechanic, endlessly creative applications.")
CommunityThread.create!(community: zl_com, user: user1, title: "Korok seeds — how many did you find?", content: "I have 427 and I think I've lost my mind.")

# Balatro
bal_com = communities[balatro.id]
CommunityThread.create!(community: bal_com, user: user1, title: "Best joker combo?", content: "Ride the Bus + Supernova is my current obsession. Scales insanely fast.")
CommunityThread.create!(community: bal_com, user: user3, title: "Gold stake cleared — tips?", content: "Finally beat it on Joker build. Key was saving vouchers for the first three antes.")

# ── Lists ─────────────────────────────────────────────────────────────────────

list_admin = List.create!(
  user: admin_user, name: "Admin's Picks",
  description: "The very best across all media types",
  if_private: false, content_type: ["book", "film", "game"],
  tags: ["favorites", "essential"]
)
[harry_potter, total_recall, zelda, balatro].each { |m| MediaInList.create!(list: list_admin, media: m) }

list_user1 = List.create!(
  user: user1, name: "My Watchlist",
  description: "Things I want to get through",
  if_private: false, content_type: ["film", "series"],
  tags: ["watchlist"]
)
[total_recall, brooklyn, gangwar, arcane].each { |m| MediaInList.create!(list: list_user1, media: m) }

# ── Review Comments ───────────────────────────────────────────────────────────

ReviewComment.create!(review: r_u1_hp,   user: user2,      comment: "Totally agree — the worldbuilding really is on another level.")
ReviewComment.create!(review: r_u1_hp,   user: admin_user, comment: "Great points. The sense of discovery never fades even on a reread.")
ReviewComment.create!(review: r_u2_road, user: user1,      comment: "This one wrecked me too. The final page especially.")
ReviewComment.create!(review: r_adm_tr,  user: user3,      comment: "Classic 90s action. Verhoeven really did not miss in this era.")
ReviewComment.create!(review: r_u3_arc,  user: user1,      comment: "Jinx's arc is genuinely one of the best in animated TV, full stop.")

# ── Review Likes ──────────────────────────────────────────────────────────────

ReviewLike.create!(review: r_u1_hp,   user: user2)
ReviewLike.create!(review: r_u1_hp,   user: admin_user)
ReviewLike.create!(review: r_u2_road, user: user1)
ReviewLike.create!(review: r_adm_zl,  user: user1)
ReviewLike.create!(review: r_adm_zl,  user: user3)
ReviewLike.create!(review: r_u3_arc,  user: user2)
ReviewLike.create!(review: r_u1_bal,  user: user3)

# ── Thread Likes ──────────────────────────────────────────────────────────────

ThreadLike.create!(community_thread: tr_root, user: user2)
ThreadLike.create!(community_thread: tr_root, user: admin_user)
ThreadLike.create!(community_thread: tr_r1,   user: user1)
ThreadLike.create!(community_thread: tr_r2,   user: user3)
ThreadLike.create!(community_thread: tr_r3,   user: user1)
