SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- BƯỚC 1: CHÈN DỮ LIỆU BẢNG CHA (USERS)
-- Dữ liệu cho bảng users (ID 1, 2, 3)
COPY public.users (id, full_name, email, phone, password_hash, user_type, is_verified, created_at, updated_at) FROM stdin;
1	nhi	nhi@gmail.com	012345678	$2b$10$Pml2WFZJc2RfkeQxp2M4lOuvgiVjt8BTZlJqxAtYwCY44B8ZXJyIe	customer	f	2025-11-08 09:21:58.505	2025-11-08 09:21:58.505
2	thao nhi	thaonhi@gmail.com	0348990415	$2b$10$Xlp4NiNdM4EteYocITFbluDgz2uLfvFfSCliI5BJYN7LiqPyPPwsy	seller	f	2025-11-09 02:32:16.25	2025-11-09 02:34:11.016
3	phi quan	quan@gmail.com	0123454122	$2b$10$40OEBqmm51lxqy9P38aEW.yVD7h45hZyiAlqlxNbcewuhVYwXFeS.	customer	f	2025-11-09 14:07:09.646	2025-11-09 14:07:09.646
\.

-- Dữ liệu cho bảng categories (Bảng không có FK tham chiếu đến bảng khác)
COPY public.categories (id, name, icon, color, description, is_active, created_at, updated_at) FROM stdin;
1	Điện thoại	phone-portrait	#EF4444	Smartphone và thiết bị di động	t	2025-11-09 03:47:29.518	2025-11-09 03:47:29.518
2	Laptop	laptop	#3B82F6	Máy tính xách tay	t	2025-11-09 03:47:29.524	2025-11-09 03:47:29.524
3	Tai nghe	headset	#10B981	Tai nghe và âm thanh	t	2025-11-09 03:47:29.527	2025-11-09 03:47:29.527
4	Đồng hồ	watch	#F59E0B	Đồng hồ thông minh và truyền thống	t	2025-11-09 03:47:29.53	2025-11-09 03:47:29.53
5	Máy ảnh	camera	#8B5CF6	Máy ảnh và phụ kiện	t	2025-11-09 03:47:29.534	2025-11-09 03:47:29.534
6	Phụ kiện	gift	#EC4899	Phụ kiện điện tử	t	2025-11-09 03:47:29.538	2025-11-09 03:47:29.538
\.

-- BƯỚC 2: CHÈN DỮ LIỆU BẢNG CON (PRODUCTS, SESSIONS)
-- Dữ liệu cho bảng products (tham chiếu seller_id = 2 trong users và category_id = 1 trong categories)
COPY public.products (id, name, description, price, stock, category_id, seller_id, images, rating, sold_count, is_active, created_at, updated_at) FROM stdin;
1	Điện thoại iPhone 17 Pro Max 256GB	Thông số kỹ thuật\nKích thước màn hình\t\n6.3 inches\n\nCông nghệ màn hình\t\nSuper Retina XDR OLED\n\nCamera sau\t\nCamera chính: 48MP, f/1.78, 24mm, chống rung quang học dịch chuyển cảm biến thế hệ thứ hai, Focus Pixels 100%, hỗ trợ ảnh có độ phân giải siêu cao\nHỗ trợ Telephoto 2x 12MP: 52 mm, ƒ/1.6\nCamera góc siêu rộng: 48MP, 13 mm, ƒ/2.2 và trường ảnh 120°, H\n\nCamera trước\t\n12MP, ƒ/1.9, Tự động lấy nét theo pha Focus Pixels\n\nChipset\t\nApple A18 Pro\n\nCông nghệ NFC\t\nCó\n\nBộ nhớ trong\t\n128 GB\n\nThẻ SIM\t\nSim kép (nano-Sim và e-Sim) - Hỗ trợ 2 e-Sim\n\nHệ điều hành\t\niOS 18\n\nĐộ phân giải màn hình\t\n2622 x 1206 pixels\n\nTính năng màn hình\t\nDynamic Island\nMàn hình HDR\nTrue Tone\nDải màu rộng (P3)\nHaptic Touch\nTỷ lệ tương phản 2.000.000:1\nĐộ sáng tối đa 1000 nit\n460 ppi\nLớp phủ kháng dầu chống in dấu vân tay\nHỗ trợ hiển thị đồng thời nhiều ngôn ngữ và ký tự\n\nLoại CPU\t\nCPU 6 lõi mới với 2 lõi hiệu năng và 4 lõi tiết kiệm điện\n\nTương thích\t\nTương Thích Với Thiết Bị Trợ Thính	37990000.00	200	1	2	{https://res.cloudinary.com/dnui1a2v5/image/upload/v1762681117/ecomira/products/bsvl8vit3jiypnjno9ff.jpg,https://res.cloudinary.com/dnui1a2v5/image/upload/v1762681117/ecomira/products/w125gexclbir8wjjonhz.jpg,https://res.cloudinary.com/dnui1a2v5/image/upload/v1762681117/ecomira/products/qdrwepdqgde6rz0zrun4.jpg,https://res.cloudinary.com/dnui1a2v5/image/upload/v1762681117/ecomira/products/s6eyn16pfy17oeyuzhno.jpg}	0.00	0	t	2025-11-09 09:44:01.73	2025-11-09 09:44:01.73
3	iPhone 15 Pro Max 256GB | Chính hãng VN/A	Thông số kỹ thuật\nKích thước màn hình\t\n6.7 inches\n\nCông nghệ màn hình\t\nSuper Retina XDR OLED\n\nCamera sau\t\nCamera chính: 48MP, 24 mm, ƒ/1.78\nCamera góc siêu rộng: 12 MP, 13 mm, ƒ/2.2\nCamera Tele: 12 MP\n\nCamera trước\t\n12MP, ƒ/1.9\n\nChipset\t\nApple A17 Pro 6 nhân\n\nCông nghệ NFC\t\nCó\n\nDung lượng RAM\t\n8 GB\n\nBộ nhớ trong\t\n256 GB\n\nPin\t\n4422 mAh\n\nThẻ SIM\t\n2 SIM (nano‑SIM và eSIM)\n\nHệ điều hành\t\niOS 17\n\nĐộ phân giải màn hình\t\n2796 x 1290-pixel\n\nTính năng màn hình\t\nTốc độ làm mới 120Hz\n460 ppi\n2000 nits\nHDR\nTrue Tone\nDải màu rộng (P3)\nHaptic Touch\nTỷ lệ tương phản 2.000.000:1\n\nLoại CPU\t\nCPU 6 lõi mới với 2 lõi hiệu năng và 4 lõi hiệu suất	25990000.00	350	1	2	{https://res.cloudinary.com/dnui1a2v5/image/upload/v1762682007/ecomira/products/xsmav9wptfpfufq6vx6w.jpg,https://res.cloudinary.com/dnui1a2v5/image/upload/v1762682006/ecomira/products/r3itxnmeex0lgnu92jy1.jpg,https://res.cloudinary.com/dnui1a2v5/image/upload/v1762682007/ecomira/products/wthwusegsntbsxavymfi.jpg,https://res.cloudinary.com/dnui1a2v5/image/upload/v1762682010/ecomira/products/n9jdzjpwzrkzcxjxbtkr.png,https://res.cloudinary.com/dnui1a2v5/image/upload/v1762682007/ecomira/products/jfdqtwpj6kkovxmuc3qw.jpg}	0.00	0	t	2025-11-09 09:53:58.389	2025-11-09 09:53:58.389
\.

-- Dữ liệu cho bảng orders (đang trống)
COPY public.orders (id, order_number, customer_id, total_amount, shipping_fee, status, payment_method, payment_status, shipping_name, shipping_phone, shipping_address, note, created_at, updated_at) FROM stdin;
\.

-- Dữ liệu cho bảng order_items (đang trống)
COPY public.order_items (id, order_id, product_id, seller_id, product_name, price, quantity, subtotal, image, created_at) FROM stdin;
\.

-- Dữ liệu cho bảng sessions (tham chiếu user_id = 1, 2, 3 trong users)
COPY public.sessions (id, user_id, token, expires_at, created_at) FROM stdin;
1	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjI1OTM5NzQsImV4cCI6MTc2MzE5ODc3NH0.sp34sMUoKs8XNome8E3w6URoK1aCgepQb2oFhFmdBVs	2025-11-15 09:26:14.247	2025-11-08 09:26:14.251
2	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjI1OTQzMDksImV4cCI6MTc2MzE5OTEwOX0.EVdfsxoYom7mDqLyv2l9C5wnsi9Zwc9msB5uMy0VsKY	2025-11-15 09:31:49.994	2025-11-08 09:31:49.996
3	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjI1OTYxODEsImV4cCI6MTc2MzIwMDk4MX0.XpASKS8Ep9V4yobHoLQyEnIFCtXMHeirjQZoXYadcZw	2025-11-15 10:03:01.453	2025-11-08 10:03:01.456
4	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjI2MDYyNzAsImV4cCI6MTc2MzIxMTA3MH0.Lpu4tc-hXpxT095AzoGcJCyE67rFZI3TdgEpsryGavg	2025-11-15 12:51:10.525	2025-11-08 12:51:10.527
5	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjI2MDYzNzksImV4cCI6MTc2MzIxMTE3OX0.gCjFlcYOw7-IYZbyqIYYZ2-ZvsTLQWxkKnGk_flS2CQ	2025-11-15 12:52:59.402	2025-11-08 12:52:59.404
6	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjI2MDY3MjQsImV4cCI6MTc2MzIxMTUyNH0.ww0Ds0lLtmKvgf6qA0XM7ZUgLnGMQMkzX--dXK2JGE8	2025-11-15 12:58:44.597	2025-11-08 12:58:44.599
7	2	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidGhhb25oaUBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6InNlbGxlciIsImlhdCI6MTc2MjY1NTY2NywiZXhwIjoxNzYzMjYwNDY3fQ.OdYC1dIwj9o9KjxfEHnkt5NgdKPMuNplzIklqtcfZwQ	2025-11-16 02:34:27.926	2025-11-09 02:34:27.928
8	2	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidGhhb25oaUBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6InNlbGxlciIsImlhdCI6MTc2MjY1NjA3MywiZXhwIjoxNzYzMjYwODczfQ.glwiPk_LqazwM7KAMRU0mtxGfBmFhB2ThQb3_2l9W2Y	2025-11-16 02:41:13.973	2025-11-09 02:41:13.976
9	2	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidGhhb25oaUBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6InNlbGxlciIsImlhdCI6MTc2MjY1NjY3OSwiZXhwIjoxNzYzMjYxNDc5fQ.s1NYL8J9Eh57J0dseOvNGDP3O8I9P8hvVo9in4704kY	2025-11-16 02:51:19.76	2025-11-09 02:51:19.762
10	2	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidGhhb25oaUBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6InNlbGxlciIsImlhdCI6MTc2MjY1NzEyMiwiZXhwIjoxNzYzMjYxOTIyfQ.V49frTdYtn-xKaYUGr4pS5FUgwOLjwYUqvhmmOp2Pyo	2025-11-16 02:58:42.494	2025-11-09 02:58:42.496
11	2	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidGhhb25oaUBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6InNlbGxlciIsImlhdCI6MTc2MjY1NzM2NywiZXhwIjoxNzYzMjYyMTY3fQ.1-Iv9lReY8NDXWJ1fwMsxGUDh0BJi02hPFHRB96ykJQ	2025-11-16 03:02:47.85	2025-11-09 03:02:47.852
12	2	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidGhhb25oaUBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6InNlbGxlciIsImlhdCI6MTc2MjY1NzY2MiwiZXhwIjoxNzYzMjYyNDYyfQ.OERc1175fZXFPomRxJ6KftWisQJXT1XMBCU4Qr8J9nE	2025-11-16 03:07:42.925	2025-11-09 03:07:42.927
13	2	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidGhhb25oaUBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6InNlbGxlciIsImlhdCI6MTc2MjY1ODQ2NSwiZXhwIjoxNzYzMjYzMjY1fQ.9Hcgp_otko2bUb6-nE1-YnzciOXJRWdgmDM67swQEsY	2025-11-16 03:21:05.907	2025-11-09 03:21:05.909
14	2	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidGhhb25oaUBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6InNlbGxlciIsImlhdCI6MTc2MjY2MDE1NCwiZXhwIjoxNzYzMjY0OTU0fQ.zFSe1nDlMkmOl5ruaF95iDe3B6wb_BHaDLWXjtMvTU4	2025-11-16 03:49:14.958	2025-11-09 03:49:14.959
15	2	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidGhhb25oaUBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6InNlbGxlciIsImlhdCI6MTc2MjY2MTc2NSwiZXhwIjoxNzYzMjY2NTY1fQ.hcZfojFeeb6UVeNOxF2J2fw8lk9_LBWYUkXA-nosG-0	2025-11-16 04:16:05.652	2025-11-09 04:16:05.654
16	2	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidGhhb25oaUBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6InNlbGxlciIsImlhdCI6MTc2MjY2MTg1MCwiZXhwIjoxNzYzMjY2NjUwfQ.X3tlBTbzRdS2bdXeDHuUCONDg48pLd76X7ly3543W5g	2025-11-16 04:17:30.057	2025-11-09 04:17:30.059
17	2	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidGhhb25oaUBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6InNlbGxlciIsImlhdCI6MTc2MjY2MjQ1NSwiZXhwIjoxNzYzMjY3MjU1fQ.NdNLLwtImsFTUNpbYJEi-k4ZbleWWf3XH21xtoEnS8c	2025-11-16 04:27:35.885	2025-11-09 04:27:35.887
18	2	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidGhhb25oaUBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6InNlbGxlciIsImlhdCI6MTc2MjY3NzcxMiwiZXhwIjoxNzYzMjgyNTEyfQ.aD_fKjcVc036xuHtGnHzGxc7dFAde9HVJ0JFw-STgB4	2025-11-16 08:41:52.143	2025-11-09 08:41:52.147
19	2	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidGhhb25oaUBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6InNlbGxlciIsImlhdCI6MTc2MjY3NzgwOSwiZXhwIjoxNzYzMjgyNjA5fQ.MiG702lvHrThaVfzZKNOYT2GyjZiDkux3umQTI6qK7w	2025-11-16 08:43:29.962	2025-11-09 08:43:29.964
20	2	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidGhhb25oaUBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6InNlbGxlciIsImlhdCI6MTc2MjY3ODQ4MywiZXhwIjoxNzYzMjgzMjgzfQ.O_lcpVeqdncNnWOb4tSWLFc6PoXDpwRqd16rx5Qag90	2025-11-16 08:54:43.683	2025-11-09 08:54:43.685
21	2	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidGhhb25oaUBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6InNlbGxlciIsImlhdCI6MTc2MjY3OTM2MiwiZXhwIjoxNzYzMjg0MTYyfQ._DzFMpPPdlyt1J5fpR-3es3D3p7dbybviZ1dVGQXKNo	2025-11-16 09:09:22.997	2025-11-09 09:09:23
22	2	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidGhhb25oaUBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6InNlbGxlciIsImlhdCI6MTc2MjY4MDU0NiwiZXhwIjoxNzYzMjg1MzQ2fQ.aTFSMosH9Qr6rWPB7rSAaFYu7hZdkTXnSjSTljYmUuk	2025-11-16 09:29:06.812	2025-11-09 09:29:06.818
23	2	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidGhhb25oaUBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6InNlbGxlciIsImlhdCI6MTc2MjY5Mzc2NCwiZXhwIjoxNzYzMjk4NTY0fQ.f1iQanJEOcO4wZgQ-jzz7WG_vW2GclPzKxJxi6LDJPg	2025-11-16 13:09:24.882	2025-11-09 13:09:24.883
24	2	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidGhhb25oaUBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6InNlbGxlciIsImlhdCI6MTc2MjY5NDIyMCwiZXhwIjoxNzYzMjk5MDIwfQ.4ssjoLLnncAODsx0xwAO2ln9kkasPfOicxXYF8wusCk	2025-11-16 13:17:00.723	2025-11-09 13:17:00.725
25	2	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidGhhb25oaUBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6InNlbGxlciIsImlhdCI6MTc2MjY5NDM1NSwiZXhwIjoxNzYzMjk5MTU1fQ.TvaYfAbjWOHlTdcctvpuDhcVrFUTgSFxPIueqZhfTZc	2025-11-16 13:19:15.761	2025-11-09 13:19:15.763
26	2	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidGhhb25oaUBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6InNlbGxlciIsImlhdCI6MTc2MjY5NDQ1MywiZXhwIjoxNzYzMjk5MjUzfQ.a1_KyCfnQIy-BwXYDM-r_133r9lsMH-0p4RFY2QfkVw	2025-11-16 13:20:53.14	2025-11-09 13:20:53.142
27	2	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidGhhb25oaUBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6InNlbGxlciIsImlhdCI6MTc2MjY5NDY3MCwiZXhwIjoxNzYzMjk5NDcwfQ.a5rj_0UzJb0ytkj87EGguG63XAPAmX16bKyypyif88I	2025-11-16 13:24:30.285	2025-11-09 13:24:30.288
28	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjI2OTUxNzksImV4cCI6MTc2MzI5OTk3OX0.-4tokKeH1QX0P_NMlVgGMSE35LS1N4EoJ7m2lQDjDgE	2025-11-16 13:32:59.822	2025-11-09 13:32:59.824
29	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjI2OTUyODMsImV4cCI6MTc2MzMwMDA4M30.TnibKqh23umZDjWWhP488sWQYRMA2kk72iFlMHXsf9g	2025-11-16 13:34:43.714	2025-11-09 13:34:43.715
30	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjI2OTUzOTEsImV4cCI6MTc2MzMwMDE5MX0.BCjxxRwXgXaRuylZ5pa0YkvBIOw2oUTnSklPK4m7pW8	2025-11-16 13:36:31.441	2025-11-09 13:36:31.443
31	2	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidGhhb25oaUBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6InNlbGxlciIsImlhdCI6MTc2MjY5NTQyMCwiZXhwIjoxNzYzMzAwMjIwfQ.K6IrdezZYgE3zwNRv_dDUSAKxMDKnNxG9-FQ1HD3TlY	2025-11-16 13:37:00.159	2025-11-09 13:37:00.161
32	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjI2OTU0MzgsImV4cCI6MTc2MzMwMDIzOH0.OMwouCgdZUB3i3EWmQHwnZWCM54gDwIAu015n89iVQo	2025-11-16 13:37:18.567	2025-11-09 13:37:18.568
33	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjI2OTU4MzUsImV4cCI6MTc2MzMwMDYzNX0.Zp3buOJ-e72BxEe8POnnedvDEM6IPBEiZSwZhno9VWc	2025-11-16 13:43:55.008	2025-11-09 13:43:55.011
34	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjI2OTU5ODQsImV4cCI6MTc2MzMwMDc4NH0.1xtxD5_3bDSCWkZ0nUGPpkGEhqp2Rx1dUERqoq2yn9s	2025-11-16 13:46:24.724	2025-11-09 13:46:24.728
35	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjI2OTYwOTIsImV4cCI6MTc2MzMwMDg5Mn0.wT5sx9DO6dQuEwGfLgFdQZQvAb63mXQHiQnAH8E9chE	2025-11-16 13:48:12.66	2025-11-09 13:48:12.665
36	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjI2OTYzOTQsImV4cCI6MTc2MzMwMTE5NH0.IZMMCqLFwUD28e3k_swqi6dgQePXhDDRJKytQdIIzQ0	2025-11-16 13:53:14.991	2025-11-09 13:53:14.993
37	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjI2OTY2MjIsImV4cCI6MTc2MzMwMTQyMn0.Vlypd22RWRbZBEyGWJ2nNCriKcL6xtpavBj8SxnEaNc	2025-11-16 13:57:02.914	2025-11-09 13:57:02.916
38	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYyNjk3MjU0LCJleHAiOjE3NjMzMDIwNTR9.uDu5MkWv6FFNHrq9mctJ5csC-JIBPE_ugGNZlho_UhE	2025-11-16 14:07:34.256	2025-11-09 14:07:34.258
39	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjI2OTc1NDAsImV4cCI6MTc2MzMwMjM0MH0.6TaQnjRaLIgvbezTOWGJ2psCoOlIjhDW399Kx-Fn1oM	2025-11-16 14:12:20.959	2025-11-09 14:12:20.961
40	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjI2OTc2NjYsImV4cCI6MTc2MzMwMjQ2Nn0.HQeY4zGcPOIKlHFhtRuHY1vzabEeCsAKnJ94FKyt-ok	2025-11-16 14:14:26.683	2025-11-09 14:14:26.685
41	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjI2OTc4OTYsImV4cCI6MTc2MzMwMjY5Nn0.WsYMnxlNb5WUl0L2DsA4EZc2krRXpHh88iTRHC5dHtg	2025-11-16 14:18:16.436	2025-11-09 14:18:16.438
42	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjI2OTgyMjksImV4cCI6MTc2MzMwMzAyOX0.sC3fvTW0Zt3cS2adcCVxPtHJG2TEjplFi6JnT-EDVc0	2025-11-16 14:23:49.88	2025-11-09 14:23:49.881
43	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjI2OTgyODQsImV4cCI6MTc2MzMwMzA4NH0.WLRyo8ATUk1bARiRRGSU4wEDUvJBo1eSM8QDRl9YwXg	2025-11-16 14:24:44.273	2025-11-09 14:24:44.274
44	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjI2OTg1ODAsImV4cCI6MTc2MzMwMzM4MH0.05JUZQUGH00ujgwwRTUmdSYodmtv6ogxusC-dAVOSgQ	2025-11-16 14:29:40.314	2025-11-09 14:29:40.316
45	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjI2OTkyODQsImV4cCI6MTc2MzMwNDA4NH0.FIRq5lAwq0XUcAAcq05JPoIWzAhs6tr8j0s--g_pIg4	2025-11-16 14:41:24.816	2025-11-09 14:41:24.819
\.

-- BƯỚC 3: ĐỒNG BỘ ID (SETVAL)
-- SETVAL: Đồng bộ hóa các bộ đếm ID (SEQUENCE)
SELECT pg_catalog.setval('public.users_id_seq', 3, true);
SELECT pg_catalog.setval('public.categories_id_seq', 6, true);
SELECT pg_catalog.setval('public.products_id_seq', 3, true);
SELECT pg_catalog.setval('public.orders_id_seq', 1, false);
SELECT pg_catalog.setval('public.order_items_id_seq', 1, false);
SELECT pg_catalog.setval('public.sessions_id_seq', 45, true);

-- Kết thúc PostgreSQL database dump