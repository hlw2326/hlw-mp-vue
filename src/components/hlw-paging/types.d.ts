export interface HlwPagingReturnData<T = any> {
    totalList: T[];
    noMore: boolean;
}

export interface HlwPagingRef<T = any> {
    reload: (animate?: boolean) => Promise<HlwPagingReturnData<T>> | undefined;
    refresh: () => Promise<HlwPagingReturnData<T>> | undefined;
    refreshToPage: (page: number) => Promise<HlwPagingReturnData<T>> | undefined;
    complete: (data?: T[] | false, success?: boolean) => Promise<HlwPagingReturnData<T>> | undefined;
    completeByTotal: (data: T[], total: number, success?: boolean) => Promise<HlwPagingReturnData<T>> | undefined;
    completeByNoMore: (data: T[], noMore: boolean, success?: boolean) => Promise<HlwPagingReturnData<T>> | undefined;
    completeByError: (cause: string) => Promise<HlwPagingReturnData<T>> | undefined;
    completeByKey: (data: T[], key: string, success?: boolean) => Promise<HlwPagingReturnData<T>> | undefined;
    clear: () => void;
    addDataFromTop: (data: T | T[], scrollToTop?: boolean, animate?: boolean) => void;
    resetTotalData: (data: T[]) => void;
    endRefresh: () => void;
    updateCustomRefresherHeight: () => void;
    goF2: () => void;
    closeF2: () => void;
    doLoadMore: (source?: "click" | "toBottom") => void;
    updatePageScrollTop: (scrollTop: number) => void;
    updatePageScrollTopHeight: () => void;
    updatePageScrollBottomHeight: () => void;
    updateLeftAndRightWidth: () => void;
    updateFixedLayout: () => void;
    doInsertVirtualListItem: (item: T, index: number) => void;
    didUpdateVirtualListCell: (index: number) => void;
    didDeleteVirtualListCell: (index: number) => void;
    updateVirtualListRender: () => void;
    setLocalPaging: (data: T[], success?: boolean) => Promise<HlwPagingReturnData<T>> | undefined;
    doChatRecordLoadMore: () => void;
    addChatRecordData: (data: T | T[], scrollToBottom?: boolean, animate?: boolean) => void;
    addKeyboardHeightChangeListener: () => void;
    scrollToTop: (animate?: boolean) => void;
    scrollToBottom: (animate?: boolean) => void;
    scrollIntoViewById: (id: string, offset?: number, animate?: boolean) => void;
    scrollIntoViewByNodeTop: (top: number, offset?: number, animate?: boolean) => void;
    scrollToY: (y: number, offset?: number, animate?: boolean) => void;
    scrollToX: (x: number, offset?: number, animate?: boolean) => void;
    scrollIntoViewByIndex: (index: number, offset?: number, animate?: boolean) => void;
    scrollIntoViewByView: (view: unknown, offset?: number, animate?: boolean) => void;
    setSpecialEffects: (args: Record<string, any>) => void;
    setListSpecialEffects: (args: Record<string, any>) => void;
    updateCache: () => void;
    getVersion: () => string | undefined;
}

export interface HlwPagingInstance<T = any> extends HlwPagingRef<T> {}
