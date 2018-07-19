export class mapper {
    active_tab: string;
    followerFilePath: string;
    is_tote: boolean;
    checked = false;
    active: false;
    follower_tags = [];
    followers = [];
    highlights = [];
    selected_follower_name: string;
    topUserToteId: number;
    spinner_for_active: string;
    isTop = 0;
    isMe = 0;
    meFilePath: string;
    my_highlights = [];
    topFilePath: string;
    topVote = {
        currentUserVote: 0,
        isCurrentUserVote: 0,
        rating: 0
    }
    top_highlights = [];
    top_tags = [];
    userAnnotote = {
        anototeDetail: {
            annotote: {},
            meToteFollowTop: {}
        },
        id: 0,
        isMe: 0,
        isTop: 0,

    }
    chatGroup = {

    }
    createdAt: number;
    constructor(tote) {
        this.startMapping(tote);
    }

    startMapping(tote) {
        this.active_tab = tote.active_tab;
        this.createdAt = tote.created_at;
        //
        this.isTop = tote.isTop;

    }
}