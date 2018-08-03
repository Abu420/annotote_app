export class mapper {
    active_tab: string;
    is_tote: boolean;
    isChat: boolean;
    source: string;
    checked = false;
    active: false;
    moreOptions: boolean = false;
    follower_tags = [];
    followers = [];
    highlights = [];
    followerFilePath: string;
    follower_title: string;
    selected_follower_name: string;
    topUserToteId: number;
    spinner_for_active: boolean;
    isTop = 0;
    id;
    isMe = 0;
    meFilePath: string;
    my_highlights: any = null;
    topFilePath: string;
    top_title: string;
    topVote = {
        currentUserVote: 0,
        isCurrentUserVote: 0,
        rating: 0,
        isVoted: []
    }
    top_highlights: any = null;
    top_tags: any = null;
    userAnnotote: any = {
        annotote: null,
        user: null,
        anototeDetail: {
            annotote: {},
            follows: [],
            meToteFollowTop: {},
            user: null
        },
        id: 0,
        isMe: 0,
        isTop: 0,
        createdAt: 0
    }
    chatGroupId: number;
    chatGroup: any = null;
    createdAt: number;
    constructor(tote, currentUser) {
        this.startMapping(tote, currentUser);
    }

    startMapping(tote, currentUser) {
        if (tote.is_tote == true) {
            this.id = tote.id;
            this.is_tote = tote.is_tote;
            this.active_tab = tote.active_tab;
            this.source = tote.source;
            this.isTop = tote.isTop;
            this.userAnnotote.anototeDetail.isTop = tote.isTop;
            this.userAnnotote.anototeDetail.isMe = tote.user_annotote[0].is_me;
            this.createdAt = tote.created_at;
            this.topUserToteId = tote.topUserToteId;
            this.spinner_for_active = false;
            this.mapAnotote(tote);
            if (tote.user_annotote[0].is_me == 1) {
                this.isMe = tote.user_annotote[0].is_me;
                this.userAnnotote.anototeDetail.user = currentUser;
                this.setMeTab(tote.user_annotote[0]);
            }
            if ((tote.user_annotote[0].is_me == 1 && tote.user_annotote.length > 1) || tote.user_annotote[0].is_me == 0) {
                var i;
                if (tote.user_annotote[0].is_me == 0)
                    i = 0;
                else
                    i = 1
                for (i; i < tote.user_annotote.length; i++) {
                    var follower = this.setFollowsTab(tote.user_annotote[i], currentUser)
                    this.userAnnotote.anototeDetail.follows.push(follower);
                    if (i == 0 || i == 1) {
                        this.followerFilePath = follower.followTote.filePath;
                        this.selected_follower_name = follower.firstName;
                        this.follower_tags = follower.followTote.tags;
                        this.follower_title = follower.followTote.annototeTitle;
                        if (this.active_tab == 'follows') {
                            this.highlights = Object.assign(follower.highlights);
                            this.userAnnotote.id = follower.followTote.id;
                            this.userAnnotote.anototeDetail.user = follower;
                            this.userAnnotote.createdAt = tote.user_annotote[i].created_at;
                        }
                    }
                }
                this.followers = this.userAnnotote.anototeDetail.follows;
            }
            if (tote.isTop == 1) {
                for (const top_tote of tote.user_annotote) {
                    if (top_tote.id == tote.topUserToteId) {
                        this.topFilePath = top_tote.file_path;
                        this.top_highlights = this.allHighlights(top_tote.annotote_heighlight);
                        this.top_tags = this.allTags(top_tote.annotote_tags);
                        this.top_title = top_tote.annotote_title;
                        this.topVote.rating = this.calculateRating(top_tote.annotote_votes);
                        this.topVote.isVoted = top_tote.annotote_votes;
                        this.userAnnotote.isVoted = top_tote.annotote_votes;
                        for (const vote of top_tote.annotote_votes) {
                            if (vote.user_id == currentUser.id) {
                                this.topVote.currentUserVote = vote.vote;
                                this.topVote.isCurrentUserVote = 1;
                                break;
                            }
                        }
                        break;
                    }
                }
                if (this.active_tab == 'top') {
                    this.highlights = Object.assign(this.top_highlights);
                }
            }
        } else if (tote.isChat == true && tote.is_tote == false) {
            this.userAnnotote = null;
            this.isChat = true;
            this.chatGroupId = tote.id;
            this.active_tab = 'search';
            this.mapChatGroup(tote);
        }
    }

    mapAnotote(tote) {
        this.userAnnotote.annotote = {
            id: tote.id,
            link: tote.link,
            localLink: tote.local_link,
            title: tote.title,
            source: tote.source,
            createdAt: tote.created_at,
            htmlId: tote.html_id,
            htmlClass: tote.html_class
        }
    }

    setMeTab(me_version) {
        this.userAnnotote.anototeDetail.meToteFollowTop = {
            annototeTitle: me_version.annotote_title,
            id: me_version.id,
            annototeId: me_version.annotote_id,
            rating: me_version.rating,
            privacy: me_version.privacy,
            tags: this.allTags(me_version.annotote_tags),
            filePath: me_version.file_path,
            createdAt: me_version.created_at
        }
        this.userAnnotote.id = me_version.id;
        this.userAnnotote.createdAt = me_version.created_at;
        this.userAnnotote.id = me_version.id;
        this.my_highlights = this.allHighlights(me_version.annotote_heighlight);
        this.highlights = this.my_highlights;
        this.meFilePath = me_version.file_path;
    }

    setFollowsTab(follows_version, currentUser) {
        var follows = {
            email: follows_version.user.email,
            firstName: follows_version.user.first_name,
            id: follows_version.user.id,
            followTote: {
                annototeId: follows_version.annotote_id,
                annototeTitle: follows_version.annotote_title,
                rating: this.calculateRating(follows_version.annotote_votes),
                privacy: follows_version.privacy,
                filePath: follows_version.file_path,
                id: follows_version.id,
                tags: this.allTags(follows_version.annotote_tags),
                isVoted: follows_version.annotote_votes,
                currentUserVote: 0,
                isCurrentUserVote: 0,
                createdAt: follows_version.created_at
            },
            highlights: this.allHighlights(follows_version.annotote_heighlight)
        }
        for (const vote of follows_version.annotote_votes) {
            if (vote.user_id == currentUser.id) {
                follows.followTote.currentUserVote = vote.vote;
                follows.followTote.isCurrentUserVote = 1;
                break;
            }
        }
        return follows;
    }

    allHighlights(server_highlights) {
        var resultant = []
        server_highlights.forEach(server_highlight => {
            var highlight = {
                comment: server_highlight.comment,
                createdAt: server_highlight.created_at,
                highlightText: server_highlight.highlight_text,
                id: server_highlight.id,
                identifier: server_highlight.identifier,
                order: server_highlight.order,
                tags: this.allTags(server_highlight.tags),
                userToteId: server_highlight.user_tote_id
            }
            resultant.push(highlight);
        });
        return resultant;
    }

    allTags(tags) {
        var resultant = [];
        tags.forEach(tag => {
            var wrapper_tag = {
                userToteId: tag.user_tote_id,
                annotationId: tag.annotation_id,
                chatId: tag.chat_id,
                createdAt: tag.created_at,
                id: tag.id,
                link: tag.link,
                tagId: tag.tag_id,
                tagText: tag.tag_text
            }

            resultant.push(wrapper_tag);
        });
        return resultant;
    }

    mapChatGroup(tote) {
        this.chatGroup = {
            id: tote.id,
            name: tote.name,
            rating: tote.rating,
            currentUserVote: 0,
            isCurrentUserVote: 0,
            createdAt: tote.created_at,
            groupUsers: this.mapGroupUsers(tote.chat_group),
            chatTags: this.allTags(tote.chat_tag),
            messagesUser: this.mapMessages(tote.messages)
        }
    }

    mapGroupUsers(users) {
        var groupUsers = [];
        users.forEach(group => {
            var user_wrapper = {
                id: group.id,
                groupId: group.group_id,
                userId: group.user_id,
                anototeId: group.anotote_id,
                subject: group.subject,
                user: this.mapUser(group.user),
                privacy: group.privacy,
                deleted: group.deleted,
                groupAdmin: group.group_admin
            }
            groupUsers.push(user_wrapper);
        });
        return groupUsers;
    }

    mapUser(user) {
        var incoming = {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            description: user.description
        }
        return incoming;
    }

    mapMessages(messages) {
        var resultant = [];
        messages.forEach(message => {
            var msg_wrapper = {
                id: message.id,
                senderId: message.sender_id,
                groupId: message.group_id,
                anototeId: message.anotote_id,
                text: message.text,
                subject: message.subject,
                read: message.read,
                messageTags: [],
                createdAt: message.created_at
            }
            resultant.push(msg_wrapper);
        });
        return resultant;
    }

    calculateRating(votes) {
        var totalUpvotes = 0;
        votes.forEach(element => {
            if (element.vote == 1)
                totalUpvotes++;
        });
        return totalUpvotes > 0 ? (totalUpvotes / votes.length) * 100 : 0;
    }
}