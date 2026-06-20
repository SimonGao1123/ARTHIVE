class ListMember < ApplicationRecord
    belongs_to :list
    belongs_to :user

    enum :status, { pending: "pending", accepted: "accepted", rejected: "rejected" }, prefix: true
    enum :role, { member: "member", admin: "admin" }, prefix: true

end
