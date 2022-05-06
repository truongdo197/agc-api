# Agriconnect-api

api cho agriconnect

# Name

Agriconnect

# Description

website so sánh các mặt hàng liên quan đến nông nghiệp

# Refer

website: rekuten.com || kakaku.com || smashop.jp

# Server overview

Sử dụng nodejs, express, mongodb, mysql, redis

Chạy trên port 3000

Connect database to server: waiting

# Folder structure

- config: chọn môi trường để chạy, một trong 3 môi trường (dev || production || starging), lúc phát triển chạy trên môi trường dev <br />
- decorator: định nghĩa các method (GET,PUT,POST,DELETE) và routePrefix đến các api <br />
- entity: định nghĩa các thực thể của từng bảng trong databse <br />
- (\*)feature: nơi viết các api, đây là phần chính xử lý logic + controller -> service -> model <br />
- middleware: kiểm tra token người dùng <br />
- public: chứa các file tĩnh <br />
- types: định nghĩa các kiểu interface dùng chung, các enum báo lỗi dùng chung <br />
- utils: chứa các hàm dùng chung <br />
  \*Note: tập chung vào folder feature <br />

# Require

- cài đặt mysql, mongo, prettier, eslint
- sử dụng gitlab

# Recommendation

- Sử dụng VSCode

# Setup and run

- tạo databse agriconnect dưới local
- tạo fil .env giống .env.example
- npm install
- npm start
