export class SearchUnPinned {
    public id;
    public bookMarked;
    public linkTitle;
    public term;
    public userToteId;
    public userId;
    constructor(bookmark, linkTitle, term, userId, toteId) {
        this.id = 0;
        this.bookMarked = bookmark;
        this.linkTitle = linkTitle;
        this.term = term;
        this.userId = userId;
        this.userToteId = toteId;
    }
}
