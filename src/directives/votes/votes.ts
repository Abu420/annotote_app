import { Component, Input, Output, EventEmitter } from "@angular/core";
import { AuthenticationService } from "../../services/auth.service";
import { UtilityMethods } from "../../services/utility_methods";
import { AnototeService } from "../../services/anotote.service";

@Component({
    selector: 'vote-footer',
    templateUrl: 'votes.html',
})
export class Votes {
    @Input() current_color: string;
    @Input() current_active_anotote: any;
    @Input('page') current_page: string;
    @Output('toast-loading') showLoading: EventEmitter<string> = new EventEmitter<string>();
    @Output('chat-participants') showThem: EventEmitter<string> = new EventEmitter<string>();
    @Output('tote-participants') tote_participants: EventEmitter<string> = new EventEmitter<string>();
    @Output('options') showOptions: EventEmitter<string> = new EventEmitter<string>();
    private user;
    constructor(authService: AuthenticationService,
        public anototeService: AnototeService,
        public utilityMethods: UtilityMethods) {
        this.user = authService.getUser();
    }

    upvote() {
        if (this.current_color != 'top') {
            if (this.current_active_anotote.active_tab == 'top') {
                // this.showLoading.emit('Upvoting');
                var params = {
                    user_tote_id: this.current_active_anotote.topUserToteId,
                    vote: 1,
                    created_at: this.utilityMethods.get_php_wala_time()
                }
                this.anototeService.vote_anotote(params).subscribe((success) => {
                    // this.showLoading.emit('');
                    this.syncTopVotes(success);
                    for (let follower of this.current_active_anotote.followers) {
                        if (follower.followTote.id == this.current_active_anotote.topUserToteId) {
                            this.syncFollowerandTopVotes(follower, success);
                            break;
                        }
                    }
                }, (error) => {
                    // this.showLoading.emit('');
                    this.showLoading.emit("TOAST");
                })
            } else if (this.current_active_anotote.active_tab == 'follows') {
                // this.showLoading.emit('Upvoting');
                var follower = this.selectedFollowerToteId();
                var params = {
                    user_tote_id: follower.followTote.id,
                    vote: 1,
                    created_at: this.utilityMethods.get_php_wala_time()
                }
                this.anototeService.vote_anotote(params).subscribe((success) => {
                    // this.showLoading.emit('');
                    this.syncFollowerandTopVotes(follower, success)
                    if (follower.followTote.id == this.current_active_anotote.topUserToteId) {
                        this.syncTopVotes(success);
                    }
                }, (error) => {
                    // this.showLoading.emit('');
                    this.showLoading.emit("TOAST");;
                })
            }
        } else {
            if (this.current_active_anotote.active_tab == 'top') {
                // this.showLoading.emit('Upvoting');
                var params = {
                    user_tote_id: this.current_active_anotote.anototeDetail.userAnnotote.id,
                    vote: 1,
                    created_at: this.utilityMethods.get_php_wala_time()
                }
                this.anototeService.vote_anotote(params).subscribe((success) => {
                    // this.showLoading.emit('');
                    this.syncTopandFollowsVotes(success);
                    for (let follower of this.current_active_anotote.anototeDetail.follows) {
                        if (follower.followTote.id == this.current_active_anotote.anototeDetail.userAnnotote.id) {
                            this.syncFollowerandTopVotes(follower, success);
                            break;
                        }
                    }
                }, (error) => {
                    // this.showLoading.emit('');
                    this.showLoading.emit("TOAST");;
                })
            } else if (this.current_active_anotote.active_tab == 'follows') {
                // this.showLoading.emit('Upvoting');
                var follower = this.selectedFollowerTopPage();
                var params = {
                    user_tote_id: follower.followTote.id,
                    vote: 1,
                    created_at: this.utilityMethods.get_php_wala_time()
                }
                this.anototeService.vote_anotote(params).subscribe((success) => {
                    // this.showLoading.emit('');
                    this.syncFollowerandTopVotes(follower, success);
                    if (follower.followTote.id == this.current_active_anotote.anototeDetail.userAnnotote.id) {
                        this.syncTopandFollowsVotes(success);
                    }
                }, (error) => {
                    // this.showLoading.emit('');
                    this.showLoading.emit("TOAST");;
                })
            }
        }
    }

    downvote() {
        if (this.current_color != 'top') {
            if (this.current_active_anotote.active_tab == 'top') {
                // this.showLoading.emit('Downvoting');
                var params = {
                    user_tote_id: this.current_active_anotote.topUserToteId,
                    vote: 0,
                    created_at: this.utilityMethods.get_php_wala_time()
                }
                this.anototeService.vote_anotote(params).subscribe((success) => {
                    // this.showLoading.emit('');
                    this.syncTopVotes(success);
                    for (let follower of this.current_active_anotote.followers) {
                        if (follower.followTote.id == this.current_active_anotote.topUserToteId) {
                            this.syncFollowerandTopVotes(follower, success);
                            break;
                        }
                    }
                }, (error) => {
                    // this.showLoading.emit('');
                    this.showLoading.emit("TOAST");;
                })
            } else if (this.current_active_anotote.active_tab == 'follows') {
                // this.showLoading.emit('Downvoting');
                var follower = this.selectedFollowerToteId();
                var params = {
                    user_tote_id: follower.followTote.id,
                    vote: 0,
                    created_at: this.utilityMethods.get_php_wala_time()
                }
                this.anototeService.vote_anotote(params).subscribe((success) => {
                    // this.showLoading.emit('');
                    this.syncFollowerandTopVotes(follower, success)
                    if (follower.followTote.id == this.current_active_anotote.topUserToteId) {
                        this.syncTopVotes(success);
                    }
                }, (error) => {
                    // this.showLoading.emit('');
                    this.showLoading.emit("TOAST");;
                })
            }
        } else {
            if (this.current_active_anotote.active_tab == 'top') {
                // this.showLoading.emit('Downvoting');
                var params = {
                    user_tote_id: this.current_active_anotote.anototeDetail.userAnnotote.id,
                    vote: 0,
                    created_at: this.utilityMethods.get_php_wala_time()
                }
                this.anototeService.vote_anotote(params).subscribe((success) => {
                    // this.showLoading.emit('');
                    this.syncTopandFollowsVotes(success);
                    for (let follower of this.current_active_anotote.anototeDetail.follows) {
                        if (follower.followTote.id == this.current_active_anotote.anototeDetail.userAnnotote.id) {
                            this.syncFollowerandTopVotes(follower, success);
                            break;
                        }
                    }
                }, (error) => {
                    // this.showLoading.emit('');
                    this.showLoading.emit("TOAST");;
                })
            } else if (this.current_active_anotote.active_tab == 'follows') {
                // this.showLoading.emit('Downvoting');
                var follower = this.selectedFollowerTopPage();
                var params = {
                    user_tote_id: follower.followTote.id,
                    vote: 0,
                    created_at: this.utilityMethods.get_php_wala_time()
                }
                this.anototeService.vote_anotote(params).subscribe((success) => {
                    // this.showLoading.emit('');
                    this.syncFollowerandTopVotes(follower, success);
                    if (follower.followTote.id == this.current_active_anotote.anototeDetail.userAnnotote.id) {
                        this.syncTopandFollowsVotes(success);
                    }
                }, (error) => {
                    // this.showLoading.emit('');
                    this.showLoading.emit("TOAST");;
                })
            }
        }
    }

    discardVote() {
        // this.showLoading.emit("Please wait");
        if (this.current_color != 'top') {
            if (this.current_active_anotote.active_tab == 'top') {
                var params = {
                    user_tote_id: this.current_active_anotote.topUserToteId,
                    user_id: this.user.id
                }
                this.anototeService.deleteVote(params).subscribe((success) => {
                    // this.showLoading.emit('');
                    this.syncTopVotes(success);
                    for (let follower of this.current_active_anotote.followers) {
                        if (follower.followTote.id == this.current_active_anotote.topUserToteId) {
                            this.syncFollowerandTopVotes(follower, success);
                            break;
                        }
                    }
                }, (error) => {
                    // this.showLoading.emit('');
                    this.showLoading.emit("TOAST");
                })
            } else if (this.current_active_anotote.active_tab == 'follows') {
                var follower = this.selectedFollowerToteId();
                var params = {
                    user_tote_id: follower.followTote.id,
                    user_id: this.user.id
                }
                this.anototeService.deleteVote(params).subscribe((success) => {
                    // this.showLoading.emit('');
                    this.syncFollowerandTopVotes(follower, success);
                    if (follower.followTote.id == this.current_active_anotote.topUserToteId) {
                        this.syncTopVotes(success);
                    }
                }, (error) => {
                    // this.showLoading.emit('');
                    this.showLoading.emit("TOAST");
                })
            }
        } else {
            if (this.current_active_anotote.active_tab == 'top') {
                var params = {
                    user_tote_id: this.current_active_anotote.anototeDetail.userAnnotote.id,
                    user_id: this.user.id
                }
                this.anototeService.deleteVote(params).subscribe((success) => {
                    // this.showLoading.emit('');
                    this.syncTopandFollowsVotes(success);
                    for (let follower of this.current_active_anotote.anototeDetail.follows) {
                        if (follower.followTote.id == this.current_active_anotote.anototeDetail.userAnnotote.id) {
                            this.syncFollowerandTopVotes(follower, success);
                            break;
                        }
                    }
                }, (error) => {
                    // this.showLoading.emit('');
                    this.showLoading.emit("TOAST");
                })
            } else if (this.current_active_anotote.active_tab == 'follows') {
                var follower = this.selectedFollowerTopPage();
                var params = {
                    user_tote_id: follower.followTote.id,
                    user_id: this.user.id
                }
                this.anototeService.deleteVote(params).subscribe((success) => {
                    // this.showLoading.emit('');
                    this.syncFollowerandTopVotes(follower, success);
                    if (follower.followTote.id == this.current_active_anotote.anototeDetail.userAnnotote.id) {
                        this.syncTopandFollowsVotes(success);
                    }
                }, (error) => {
                    // this.showLoading.emit('');
                    this.showLoading.emit("TOAST");
                })
            }
        }
    }

    syncTopVotes(success) {
        this.current_active_anotote.topVote.currentUserVote = success.data.annotote.currentUserVote;
        this.current_active_anotote.topVote.isCurrentUserVote = success.data.annotote.isCurrentUserVote;
        this.current_active_anotote.topVote.rating = success.data.annotote.rating;
    }

    syncFollowerandTopVotes(follower, success) {
        follower.followTote.currentUserVote = success.data.annotote.currentUserVote;
        follower.followTote.isCurrentUserVote = success.data.annotote.isCurrentUserVote;
        follower.followTote.rating = success.data.annotote.rating;
    }

    syncTopandFollowsVotes(success) {
        this.current_active_anotote.anototeDetail.userAnnotote.currentUserVote = success.data.annotote.currentUserVote;
        this.current_active_anotote.anototeDetail.userAnnotote.isCurrentUserVote = success.data.annotote.isCurrentUserVote;
        this.current_active_anotote.anototeDetail.userAnnotote.rating = success.data.annotote.rating;
        this.current_active_anotote.userAnnotote.currentUserVote = success.data.annotote.currentUserVote;
        this.current_active_anotote.userAnnotote.isCurrentUserVote = success.data.annotote.isCurrentUserVote;
        this.current_active_anotote.userAnnotote.rating = success.data.annotote.rating;
    }

    selectedFollowerToteId() {
        for (let follower of this.current_active_anotote.followers) {
            if (follower.firstName == this.current_active_anotote.selected_follower_name) {
                return follower;
            }
        }
        return null;
    }

    selectedFollowerTopPage() {
        for (let follower of this.current_active_anotote.anototeDetail.follows) {
            if (follower.firstName == this.current_active_anotote.selected_follower_name) {
                return follower;
            }
        }
        return null;
    }

    upvoteChatTote() {
        var params = {
            chat_id: this.current_active_anotote.chatGroup.id,
            vote: 1,
            created_at: this.utilityMethods.get_php_wala_time()
        }
        this.anototeService.vote_chat_tote(params).subscribe((success) => {

            this.current_active_anotote.chatGroup.currentUserVote = 1;
            this.current_active_anotote.chatGroup.isCurrentUserVote = 1;
            this.current_active_anotote.chatGroup.rating = success.data.chat.rating;
        }, (error) => {
            this.showLoading.emit("TOAST");
        })
    }

    downvoteChatTote() {
        var params = {
            chat_id: this.current_active_anotote.chatGroup.id,
            vote: 0,
            created_at: this.utilityMethods.get_php_wala_time()
        }
        this.anototeService.vote_chat_tote(params).subscribe((success) => {
            this.current_active_anotote.chatGroup.currentUserVote = 0;
            this.current_active_anotote.chatGroup.isCurrentUserVote = 1;
            this.current_active_anotote.chatGroup.rating = success.data.chat.rating;
        }, (error) => {
            this.showLoading.emit("TOAST");
        })
    }

    discardChatVote() {
        var params = {
            chat_id: this.current_active_anotote.chatGroup.id,
            user_id: this.user.id
        }
        this.anototeService.deleteChatVote(params).subscribe((success) => {
            this.current_active_anotote.chatGroup.currentUserVote = 0;
            this.current_active_anotote.chatGroup.isCurrentUserVote = 0;
            this.current_active_anotote.chatGroup.rating = success.data.chat.rating;
        }, (error) => {
            this.showLoading.emit("TOAST");
        })
    }

    show_chat_paticipants() {
        this.showThem.emit('PARTICIPANTS');
    }
    show_tote_participants(type: string) {
        this.tote_participants.emit(type);
    }
    toteOptions() {
        this.showOptions.emit('showMe')
    }
}
