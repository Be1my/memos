import { defineRelations } from "drizzle-orm";
import { attachment } from "./attachment.table";
import { account, session, user, verification } from "./auth.table";
import { idp } from "./idp.table";
import { inbox } from "./inbox.table";
import { memo } from "./memo.table";
import { memoRelation } from "./memo-relation.table";
import { memoShare } from "./memo-share.table";
import { reaction } from "./reaction.table";
import { systemSetting } from "./system-setting.table";
import { userIdentity } from "./user-identity.table";
import { userSetting } from "./user-setting.table";

const schema = {
	user,
	session,
	account,
	verification,
	systemSetting,
	userSetting,
	memo,
	memoRelation,
	attachment,
	idp,
	inbox,
	reaction,
	memoShare,
	userIdentity,
};

export const relations = defineRelations(schema, (r) => ({
	user: {
		sessions: r.many.session(),
		accounts: r.many.account(),
		userSettings: r.many.userSetting(),
		memos: r.many.memo(),
		attachments: r.many.attachment(),
		inboxSent: r.many.inbox({
			alias: "sent",
			from: r.user.id,
			to: r.inbox.senderId,
		}),
		inboxReceived: r.many.inbox({
			alias: "received",
			from: r.user.id,
			to: r.inbox.receiverId,
		}),
		reactions: r.many.reaction(),
		memoShares: r.many.memoShare(),
		userIdentities: r.many.userIdentity(),
	},
	session: {
		user: r.one.user({
			from: r.session.userId,
			to: r.user.id,
		}),
	},
	account: {
		user: r.one.user({
			from: r.account.userId,
			to: r.user.id,
		}),
	},
	userSetting: {
		user: r.one.user({
			from: r.userSetting.userId,
			to: r.user.id,
		}),
	},
	memo: {
		creator: r.one.user({
			from: r.memo.creatorId,
			to: r.user.id,
		}),
		memoRelations: r.many.memoRelation({
			from: r.memo.id,
			to: r.memoRelation.memoId,
		}),
		relatedMemos: r.many.memoRelation({
			alias: "related",
			from: r.memo.id,
			to: r.memoRelation.relatedMemoId,
		}),
		attachments: r.many.attachment(),
		memoShares: r.many.memoShare(),
	},
	memoRelation: {
		memo: r.one.memo({
			from: r.memoRelation.memoId,
			to: r.memo.id,
		}),
		relatedMemo: r.one.memo({
			alias: "related",
			from: r.memoRelation.relatedMemoId,
			to: r.memo.id,
		}),
	},
	attachment: {
		creator: r.one.user({
			from: r.attachment.creatorId,
			to: r.user.id,
		}),
		memo: r.one.memo({
			from: r.attachment.memoId,
			to: r.memo.id,
		}),
	},
	inbox: {
		sender: r.one.user({
			alias: "sent",
			from: r.inbox.senderId,
			to: r.user.id,
		}),
		receiver: r.one.user({
			alias: "received",
			from: r.inbox.receiverId,
			to: r.user.id,
		}),
	},
	reaction: {
		creator: r.one.user({
			from: r.reaction.creatorId,
			to: r.user.id,
		}),
	},
	memoShare: {
		memo: r.one.memo({
			from: r.memoShare.memoId,
			to: r.memo.id,
		}),
		creator: r.one.user({
			from: r.memoShare.creatorId,
			to: r.user.id,
		}),
	},
	userIdentity: {
		user: r.one.user({
			from: r.userIdentity.userId,
			to: r.user.id,
		}),
	},
}));
