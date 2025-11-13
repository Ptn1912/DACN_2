--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

-- Started on 2025-11-13 10:59:16

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

--
-- TOC entry 872 (class 1247 OID 17360)
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'pending',
    'confirmed',
    'preparing',
    'shipping',
    'delivered',
    'cancelled',
    'returned'
);


ALTER TYPE public."OrderStatus" OWNER TO postgres;

--
-- TOC entry 875 (class 1247 OID 17376)
-- Name: PaymentMethod; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PaymentMethod" AS ENUM (
    'cod',
    'bank_transfer',
    'momo',
    'zalopay',
    'credit_card'
);


ALTER TYPE public."PaymentMethod" OWNER TO postgres;

--
-- TOC entry 878 (class 1247 OID 17388)
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'unpaid',
    'paid',
    'refunded'
);


ALTER TYPE public."PaymentStatus" OWNER TO postgres;

--
-- TOC entry 857 (class 1247 OID 17281)
-- Name: UserType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."UserType" AS ENUM (
    'customer',
    'seller'
);


ALTER TYPE public."UserType" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 224 (class 1259 OID 17334)
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name text NOT NULL,
    icon text,
    color text,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 17333)
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_id_seq OWNER TO postgres;

--
-- TOC entry 4896 (class 0 OID 0)
-- Dependencies: 223
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- TOC entry 228 (class 1259 OID 17409)
-- Name: order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_items (
    id integer NOT NULL,
    order_id integer NOT NULL,
    product_id integer NOT NULL,
    seller_id integer NOT NULL,
    product_name text NOT NULL,
    price numeric(12,2) NOT NULL,
    quantity integer NOT NULL,
    subtotal numeric(12,2) NOT NULL,
    image text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.order_items OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 17408)
-- Name: order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_items_id_seq OWNER TO postgres;

--
-- TOC entry 4897 (class 0 OID 0)
-- Dependencies: 227
-- Name: order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.order_items_id_seq OWNED BY public.order_items.id;


--
-- TOC entry 226 (class 1259 OID 17396)
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    order_number text NOT NULL,
    customer_id integer NOT NULL,
    total_amount numeric(12,2) NOT NULL,
    shipping_fee numeric(10,2) DEFAULT 0 NOT NULL,
    status public."OrderStatus" DEFAULT 'pending'::public."OrderStatus" NOT NULL,
    payment_method public."PaymentMethod" NOT NULL,
    payment_status public."PaymentStatus" DEFAULT 'unpaid'::public."PaymentStatus" NOT NULL,
    shipping_name text NOT NULL,
    shipping_phone text NOT NULL,
    shipping_address text NOT NULL,
    note text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 17395)
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.orders_id_seq OWNER TO postgres;

--
-- TOC entry 4898 (class 0 OID 0)
-- Dependencies: 225
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- TOC entry 222 (class 1259 OID 17320)
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    price numeric(12,2) NOT NULL,
    stock integer DEFAULT 0 NOT NULL,
    category_id integer NOT NULL,
    seller_id integer NOT NULL,
    images text[],
    rating numeric(3,2) DEFAULT 0,
    sold_count integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.products OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 17319)
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_id_seq OWNER TO postgres;

--
-- TOC entry 4899 (class 0 OID 0)
-- Dependencies: 221
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- TOC entry 220 (class 1259 OID 17297)
-- Name: sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sessions (
    id integer NOT NULL,
    user_id integer NOT NULL,
    token text NOT NULL,
    expires_at timestamp(3) without time zone NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.sessions OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 17296)
-- Name: sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sessions_id_seq OWNER TO postgres;

--
-- TOC entry 4900 (class 0 OID 0)
-- Dependencies: 219
-- Name: sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sessions_id_seq OWNED BY public.sessions.id;


--
-- TOC entry 218 (class 1259 OID 17286)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    full_name text NOT NULL,
    email text NOT NULL,
    phone text,
    password_hash text NOT NULL,
    user_type public."UserType" NOT NULL,
    is_verified boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 17285)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 4901 (class 0 OID 0)
-- Dependencies: 217
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4689 (class 2604 OID 17337)
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- TOC entry 4697 (class 2604 OID 17412)
-- Name: order_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq'::regclass);


--
-- TOC entry 4692 (class 2604 OID 17399)
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- TOC entry 4683 (class 2604 OID 17323)
-- Name: products id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- TOC entry 4681 (class 2604 OID 17300)
-- Name: sessions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions ALTER COLUMN id SET DEFAULT nextval('public.sessions_id_seq'::regclass);


--
-- TOC entry 4678 (class 2604 OID 17289)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 4886 (class 0 OID 17334)
-- Dependencies: 224
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, name, icon, color, description, is_active, created_at, updated_at) FROM stdin;
1	Điện thoại	phone-portrait	#EF4444	Smartphone và thiết bị di động	t	2025-11-09 03:47:29.518	2025-11-09 03:47:29.518
2	Laptop	laptop	#3B82F6	Máy tính xách tay	t	2025-11-09 03:47:29.524	2025-11-09 03:47:29.524
3	Tai nghe	headset	#10B981	Tai nghe và âm thanh	t	2025-11-09 03:47:29.527	2025-11-09 03:47:29.527
4	Đồng hồ	watch	#F59E0B	Đồng hồ thông minh và truyền thống	t	2025-11-09 03:47:29.53	2025-11-09 03:47:29.53
5	Máy ảnh	camera	#8B5CF6	Máy ảnh và phụ kiện	t	2025-11-09 03:47:29.534	2025-11-09 03:47:29.534
6	Phụ kiện	gift	#EC4899	Phụ kiện điện tử	t	2025-11-09 03:47:29.538	2025-11-09 03:47:29.538
\.


--
-- TOC entry 4890 (class 0 OID 17409)
-- Dependencies: 228
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_items (id, order_id, product_id, seller_id, product_name, price, quantity, subtotal, image, created_at) FROM stdin;
\.


--
-- TOC entry 4888 (class 0 OID 17396)
-- Dependencies: 226
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, order_number, customer_id, total_amount, shipping_fee, status, payment_method, payment_status, shipping_name, shipping_phone, shipping_address, note, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4884 (class 0 OID 17320)
-- Dependencies: 222
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, name, description, price, stock, category_id, seller_id, images, rating, sold_count, is_active, created_at, updated_at) FROM stdin;
1	Điện thoại iPhone 17 Pro Max 256GB	Thông số kỹ thuật\nKích thước màn hình\t\n6.3 inches\n\nCông nghệ màn hình\t\nSuper Retina XDR OLED\n\nCamera sau\t\nCamera chính: 48MP, f/1.78, 24mm, chống rung quang học dịch chuyển cảm biến thế hệ thứ hai, Focus Pixels 100%, hỗ trợ ảnh có độ phân giải siêu cao\nHỗ trợ Telephoto 2x 12MP: 52 mm, ƒ/1.6\nCamera góc siêu rộng: 48MP, 13 mm, ƒ/2.2 và trường ảnh 120°, H\n\nCamera trước\t\n12MP, ƒ/1.9, Tự động lấy nét theo pha Focus Pixels\n\nChipset\t\nApple A18 Pro\n\nCông nghệ NFC\t\nCó\n\nBộ nhớ trong\t\n128 GB\n\nThẻ SIM\t\nSim kép (nano-Sim và e-Sim) - Hỗ trợ 2 e-Sim\n\nHệ điều hành\t\niOS 18\n\nĐộ phân giải màn hình\t\n2622 x 1206 pixels\n\nTính năng màn hình\t\nDynamic Island\nMàn hình HDR\nTrue Tone\nDải màu rộng (P3)\nHaptic Touch\nTỷ lệ tương phản 2.000.000:1\nĐộ sáng tối đa 1000 nit\n460 ppi\nLớp phủ kháng dầu chống in dấu vân tay\nHỗ trợ hiển thị đồng thời nhiều ngôn ngữ và ký tự\n\nLoại CPU\t\nCPU 6 lõi mới với 2 lõi hiệu năng và 4 lõi tiết kiệm điện\n\nTương thích\t\nTương Thích Với Thiết Bị Trợ Thính	37990000.00	200	1	2	{https://res.cloudinary.com/dnui1a2v5/image/upload/v1762681117/ecomira/products/bsvl8vit3jiypnjno9ff.jpg,https://res.cloudinary.com/dnui1a2v5/image/upload/v1762681117/ecomira/products/w125gexclbir8wjjonhz.jpg,https://res.cloudinary.com/dnui1a2v5/image/upload/v1762681117/ecomira/products/qdrwepdqgde6rz0zrun4.jpg,https://res.cloudinary.com/dnui1a2v5/image/upload/v1762681117/ecomira/products/s6eyn16pfy17oeyuzhno.jpg}	0.00	0	t	2025-11-09 09:44:01.73	2025-11-09 09:44:01.73
3	iPhone 15 Pro Max 256GB | Chính hãng VN/A	Thông số kỹ thuật\nKích thước màn hình\t\n6.7 inches\n\nCông nghệ màn hình\t\nSuper Retina XDR OLED\n\nCamera sau\t\nCamera chính: 48MP, 24 mm, ƒ/1.78\nCamera góc siêu rộng: 12 MP, 13 mm, ƒ/2.2\nCamera Tele: 12 MP\n\nCamera trước\t\n12MP, ƒ/1.9\n\nChipset\t\nApple A17 Pro 6 nhân\n\nCông nghệ NFC\t\nCó\n\nDung lượng RAM\t\n8 GB\n\nBộ nhớ trong\t\n256 GB\n\nPin\t\n4422 mAh\n\nThẻ SIM\t\n2 SIM (nano‑SIM và eSIM)\n\nHệ điều hành\t\niOS 17\n\nĐộ phân giải màn hình\t\n2796 x 1290-pixel\n\nTính năng màn hình\t\nTốc độ làm mới 120Hz\n460 ppi\n2000 nits\nHDR\nTrue Tone\nDải màu rộng (P3)\nHaptic Touch\nTỷ lệ tương phản 2.000.000:1\n\nLoại CPU\t\nCPU 6 lõi mới với 2 lõi hiệu năng và 4 lõi hiệu suất	25990000.00	350	1	2	{https://res.cloudinary.com/dnui1a2v5/image/upload/v1762682007/ecomira/products/xsmav9wptfpfufq6vx6w.jpg,https://res.cloudinary.com/dnui1a2v5/image/upload/v1762682006/ecomira/products/r3itxnmeex0lgnu92jy1.jpg,https://res.cloudinary.com/dnui1a2v5/image/upload/v1762682007/ecomira/products/wthwusegsntbsxavymfi.jpg,https://res.cloudinary.com/dnui1a2v5/image/upload/v1762682010/ecomira/products/n9jdzjpwzrkzcxjxbtkr.png,https://res.cloudinary.com/dnui1a2v5/image/upload/v1762682007/ecomira/products/jfdqtwpj6kkovxmuc3qw.jpg}	0.00	0	t	2025-11-09 09:53:58.389	2025-11-09 09:53:58.389
\.


--
-- TOC entry 4882 (class 0 OID 17297)
-- Dependencies: 220
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

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


--
-- TOC entry 4880 (class 0 OID 17286)
-- Dependencies: 218
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, full_name, email, phone, password_hash, user_type, is_verified, created_at, updated_at) FROM stdin;
1	nhi	nhi@gmail.com	012345678	$2b$10$Pml2WFZJc2RfkeQxp2M4lOuvgiVjt8BTZlJqxAtYwCY44B8ZXJyIe	customer	f	2025-11-08 09:21:58.505	2025-11-08 09:21:58.505
2	thao nhi	thaonhi@gmail.com	0348990415	$2b$10$Xlp4NiNdM4EteYocITFbluDgz2uLfvFfSCliI5BJYN7LiqPyPPwsy	seller	f	2025-11-09 02:32:16.25	2025-11-09 02:34:11.016
3	phi quan	quan@gmail.com	0123454122	$2b$10$40OEBqmm51lxqy9P38aEW.yVD7h45hZyiAlqlxNbcewuhVYwXFeS.	customer	f	2025-11-09 14:07:09.646	2025-11-09 14:07:09.646
\.


--
-- TOC entry 4902 (class 0 OID 0)
-- Dependencies: 223
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categories_id_seq', 6, true);


--
-- TOC entry 4903 (class 0 OID 0)
-- Dependencies: 227
-- Name: order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_items_id_seq', 1, false);


--
-- TOC entry 4904 (class 0 OID 0)
-- Dependencies: 225
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.orders_id_seq', 1, false);


--
-- TOC entry 4905 (class 0 OID 0)
-- Dependencies: 221
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.products_id_seq', 3, true);


--
-- TOC entry 4906 (class 0 OID 0)
-- Dependencies: 219
-- Name: sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sessions_id_seq', 45, true);


--
-- TOC entry 4907 (class 0 OID 0)
-- Dependencies: 217
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 3, true);


--
-- TOC entry 4715 (class 2606 OID 17343)
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- TOC entry 4724 (class 2606 OID 17417)
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- TOC entry 4720 (class 2606 OID 17407)
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- TOC entry 4712 (class 2606 OID 17332)
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- TOC entry 4705 (class 2606 OID 17305)
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- TOC entry 4702 (class 2606 OID 17295)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4722 (class 1259 OID 17422)
-- Name: order_items_order_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_items_order_id_idx ON public.order_items USING btree (order_id);


--
-- TOC entry 4725 (class 1259 OID 17423)
-- Name: order_items_product_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_items_product_id_idx ON public.order_items USING btree (product_id);


--
-- TOC entry 4726 (class 1259 OID 17424)
-- Name: order_items_seller_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_items_seller_id_idx ON public.order_items USING btree (seller_id);


--
-- TOC entry 4716 (class 1259 OID 17419)
-- Name: orders_customer_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX orders_customer_id_idx ON public.orders USING btree (customer_id);


--
-- TOC entry 4717 (class 1259 OID 17421)
-- Name: orders_order_number_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX orders_order_number_idx ON public.orders USING btree (order_number);


--
-- TOC entry 4718 (class 1259 OID 17418)
-- Name: orders_order_number_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX orders_order_number_key ON public.orders USING btree (order_number);


--
-- TOC entry 4721 (class 1259 OID 17420)
-- Name: orders_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX orders_status_idx ON public.orders USING btree (status);


--
-- TOC entry 4709 (class 1259 OID 17344)
-- Name: products_category_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX products_category_id_idx ON public.products USING btree (category_id);


--
-- TOC entry 4710 (class 1259 OID 17346)
-- Name: products_is_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX products_is_active_idx ON public.products USING btree (is_active);


--
-- TOC entry 4713 (class 1259 OID 17345)
-- Name: products_seller_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX products_seller_id_idx ON public.products USING btree (seller_id);


--
-- TOC entry 4706 (class 1259 OID 17310)
-- Name: sessions_token_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sessions_token_idx ON public.sessions USING btree (token);


--
-- TOC entry 4707 (class 1259 OID 17309)
-- Name: sessions_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX sessions_token_key ON public.sessions USING btree (token);


--
-- TOC entry 4708 (class 1259 OID 17311)
-- Name: sessions_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sessions_user_id_idx ON public.sessions USING btree (user_id);


--
-- TOC entry 4699 (class 1259 OID 17307)
-- Name: users_email_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_email_idx ON public.users USING btree (email);


--
-- TOC entry 4700 (class 1259 OID 17306)
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- TOC entry 4703 (class 1259 OID 17308)
-- Name: users_user_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_user_type_idx ON public.users USING btree (user_type);


--
-- TOC entry 4731 (class 2606 OID 17430)
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4732 (class 2606 OID 17435)
-- Name: order_items order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4733 (class 2606 OID 17440)
-- Name: order_items order_items_seller_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4730 (class 2606 OID 17425)
-- Name: orders orders_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4728 (class 2606 OID 17347)
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4729 (class 2606 OID 17352)
-- Name: products products_seller_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4727 (class 2606 OID 17312)
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


-- Completed on 2025-11-13 10:59:16

--
-- PostgreSQL database dump complete
--

