export enum ErrorCode {
	Unknown_Error = 0, // System error, unknown error
	Invalid_Input = 1,
	Password_Not_True = 2,
	Username_Not_Exist = 3,
	Token_Not_Exist = 4,
	User_Blocked = 5,
	Token_Expired = 6,
	Refresh_Token_Not_Exist = 7,
	Refresh_Token_Expire = 8,
	Permission_Denied = 9,
	User_Not_Exist = 11,
	Not_Found = 12,
	Verified_Code_Not_Correct = 13,
	Permission_Not_Found = 14,
	Role_Not_Found = 15,
	Email_Exist = 16,
	User_Exist = 17,
	Phone_Exist = 18,
	Email_Not_Exist = 19,
	Banner_Not_Exist = 20,
	Point_Not_Exist = 21,
	Product_Simiar_Not_Exist = 22,
	Socket_Not_Initialized = 23,
	Can_Not_Delete = 24,
	Missing_ASIN_Or_JAN = 25,
	ASIN_Not_Validate = 26,
	JAN_CODE_Not_Validate = 27,
	Rakuten_Missing_Item_Code = 28,
	Member_Not_Exist = 29,
	Member_Blocked = 30,
	Product_Factory_Existed = 31,
	Old_Password_Equal_New_Password = 32,
}

export enum ErrorMessage {
	Unknown_Error = '不明なエラーがおきました', // System error, unknown error
	Invalid_Input = '入力形式が正しくありません',
	Password_Not_True = 'パスワードが間違いました',
	Username_Not_Exist = 'アカウントが存在しません',
	Token_Not_Exist = 4,
	User_Blocked = 'アカウントがロックされています',
	Token_Expired = 6,
	Refresh_Token_Not_Exist = 7,
	Refresh_Token_Expire = 8,
	Permission_Denied = '権限はありません',
	User_Not_Exist = 'アカウントが存在しません',
	Not_Found = '該当レコードがありません',
	Verified_Code_Not_Correct = 13,
	Permission_Not_Found = 14,
	Role_Not_Found = 15,
	Email_Exist = 'メールアドレスは既に登録されています',
	User_Exist = 'ユーザー名は既に存在しています',
	Phone_Exist = 18,
	Email_Not_Exist = 'メールアドレスは存在しません',
	Banner_Not_Exist = 20,
	Point_Not_Exist = 21,
	Product_Simiar_Not_Exist = 22,
	Socket_Not_Initialized = 23,
	Can_Not_Delete = 24,
	Missing_ASIN_Or_JAN = 25,
	ASIN_Not_Validate = 26,
	JAN_CODE_Not_Validate = 27,
	Rakuten_Missing_Item_Code = 28,
	Member_Not_Exist = 29,
	Member_Blocked = 30,
	Product_Factory_Existed = 31,
	Old_Password_Equal_New_Password = ' 新しいパスワードは現在のパスワードと違うものでなければなりません',
}

export enum BannerPosition {
	STANDARD = 1,
	ADVERTISING = 2,
	STATIC = 3,
	CATEGORY = 4,
	SPONSOR_PRODUCT = 5,
}
export enum UserStatus {
	Active = 1,
	Inactive = 0,
}

export enum ProductFactoryStatus {
	FAILED = 0,
	SUCCESS = 1,
	PENDING = 2,
}

export enum UrlProductFactoryStatus {
	FAILED = 0,
	SUCCESS = 1,
}

export enum StatusEntity {
	ACTIVE = 1,
	DELETED = 0,
}

export enum PostStatus {
	DEFAULT = 1,
	SELECTED = 2,
}

export enum PostType {
	AGC_PICK = 1,
	AGC_CONN = 2,
}

export enum SubProductStatus {
	NEW = 1,
	OLD = 2,
}

export enum CommonType {
	HOT_PRODUCT = 1, // san pham duoc chon la SP hot
	NEWS = 2, //tin tuc moi
	NEW_PRODUCT = 3, //tin tuc ve san pham moi
	ADVERTISING_PRODUCT = 4, //sản phẩm quảng cáo,
	SLOGAN = 5,
	GOOGLE_TAG_SCRIPT = 6,
	SPONSOR_PRODUCT = 7,
	AF_Link = 8,
}

export enum CodeType {
	UNKNOW = 'UNKNOW',
	JAN_CODE = 'JAN_CODE',
	ASIN = 'ASIN',
	ISBN = 'ISBN',
}

export enum QueueName {
	PRODUCT = 'Product',
	ACTION = 'Action',
	ASIN_CODE = 'AsinCode',
	ASIN_CODE_URL = 'AsinCodeUrl',
	JAN_CODE_URL = 'JanCodeUrl',
	JAN_CODE_URL_SAIYASUNE = 'JanCodeUrlSaiyasune',
	HANDLE_CODES_FILE = 'HandleCodesFile',
}

export enum ModelName {
	SALE_CAMPAIGN = 'SaleCampaign',
	POST = 'Post',
	KEYWORD = 'Keyword',
	COMMON = 'Common',
	PRODUCT = 'Product',
	SUB_PRODUCT = 'SubProduct',
	CATEGORY = 'Category',
	USER = 'User',
	KEN = 'Ken',
	CITY = 'City',
	PERMISSION = 'Permission',
	ROLE = 'Role',
	VERIFIEDCODE = 'VerifiedCode',
	TAG = 'Tag',
	BANNER = 'Banner',
	POINT = 'Point',
	RANKING = 'Ranking',
	METRIC = 'Metric',
	CODE_MAP = 'CodeMap',
	SITE_CATEGORY = 'SiteCategory',
	CRAWL_LOG = 'CrawlLog',
	PRODUCT_FACTORY = 'ProductFactory',
	MEMBER = 'Member',
	WATCHING_LIST = 'WatchingList',
	WATCHING_PRODUCT = 'WatchingProduct',
	PRODUCT_HISTORY = 'ProductHistory',
	FAVORITE_PRODUCT = 'FavoriteProduct',
	NOTIFICATION = 'Notification',
	PRICE_LOG = 'PriceLog',
	PRODUCT_NOTI_SETTING = 'ProductNotiSetting',
}

export enum ProductNotiSettingType {
	PERCENT = 'percent',
	PRICE = 'price',
}

export enum PointType {
	Normal = 1,
	Optional = 2,
}

export enum SourceProduct {
	AMAZON = 'Amazon',
	RAKUTEN = 'Rakuten',
	YAHOO = 'Yahoo',
	PAYPAY = 'Paypay',
}
export enum VerifiedCodeStatus {
	UNUSED = 1, // chưa sử dụng
	USED = 2, // sử dụng
}
export enum Role {
	COMMON_SETTING = 'common-setting',
	CATEGORY = 'category',
	PRODUCT = 'product',
	BANNER = 'banner',
	POST = 'post',
	SALE = 'sale',
	POINT = 'point',
	SYNC = 'sync',
	ACCOUNT = 'account',
	CRAWL = 'crawl',
	USER = 'user',
	ADMIN = 'admin',
}
export enum Sort {
	DESC = 'desc',
	ASC = 'asc',
}
export enum BannerType {
	STANDARD = 1,
	ADVERTISING = 2,
	SPONSOR_PRODUCT = 3,
}

export enum JobName {
	INCREASE_NUMBERS_OF_KEYWORD = 'Increase numbers of keyword',
	MIGRATE_DATA_MONGO_TO_ELASTICSEARCH = 'Migrate data mongo to elasticseach',
	PUT_DATA_MONGO_TO_ELASTICSEARCH = 'PUT/POST data mongo to elasticseach',
	UPDATE_METRIC = 'Update metric',
	MAPPING_SUBPRODUCT_TO_PRODUCT = 'Mapping SubProduct to Product',
	PROCESS_AMAZON_PRODUCT = 'Process Amazon Product',
	ASIN_CODE_URL = 'Asin Code Url',
	JAN_CODE_URL = 'Jan Code Url',
	JAN_CODE_URL_SAIYASUNE = 'Jan code url saiyasune',
	HANDLE_CODES_FILE = 'Handle codes file',
	HANDLE_AFFILIATE_URL = 'Handle affiliate url',
	SYNC_PRODUCT_FACTORY = 'Sync Product Factory',
}

export enum RedisCrawlerQueue {
	AMAZONE_DETAIL = 'amazon_detail',
	YAHOO_SEARCH = 'yahoo_search',
	RAKUTEN_SEARCH = 'rakuten_search',
	SAIYASUNE_DETAIL = 'saiyasune_detail',
	YAHOO_DETAIL = 'yahoo_detail',
	RAKUTEN_DETAIL = 'rakuten_detail',
	AMAZON_RANKING = 'amazon_ranking',
	RAKUTEN_RANKING = 'rakuten_ranking',
	YAHOO_RANKING = 'yahoo_ranking',
}

export enum RecrawlType {
	SCHEDULED = 'schedule',
	MANUAL = 'manual'
}
