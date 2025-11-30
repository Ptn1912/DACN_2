--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

-- Started on 2025-11-29 07:52:35

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
-- TOC entry 5 (class 2615 OID 17739)
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- TOC entry 4984 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- TOC entry 881 (class 1247 OID 17800)
-- Name: KYCStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."KYCStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);


ALTER TYPE public."KYCStatus" OWNER TO postgres;

--
-- TOC entry 872 (class 1247 OID 17758)
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
-- TOC entry 875 (class 1247 OID 17774)
-- Name: PaymentMethod; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PaymentMethod" AS ENUM (
    'cod',
    'bank_transfer',
    'momo',
    'zalopay',
    'credit_card',
    'spaylater'
);


ALTER TYPE public."PaymentMethod" OWNER TO postgres;

--
-- TOC entry 884 (class 1247 OID 17808)
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'COMPLETED',
    'FAILED',
    'REFUNDED'
);


ALTER TYPE public."PaymentStatus" OWNER TO postgres;

--
-- TOC entry 878 (class 1247 OID 17788)
-- Name: SPayLaterStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."SPayLaterStatus" AS ENUM (
    'PENDING',
    'PARTIALLY_PAID',
    'PAID',
    'OVERDUE',
    'CANCELLED'
);


ALTER TYPE public."SPayLaterStatus" OWNER TO postgres;

--
-- TOC entry 869 (class 1247 OID 17753)
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
-- TOC entry 217 (class 1259 OID 17740)
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 17853)
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
-- TOC entry 224 (class 1259 OID 17852)
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
-- TOC entry 4986 (class 0 OID 0)
-- Dependencies: 224
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- TOC entry 237 (class 1259 OID 18036)
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    "actionUrl" text,
    "isRead" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 18035)
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO postgres;

--
-- TOC entry 4987 (class 0 OID 0)
-- Dependencies: 236
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- TOC entry 229 (class 1259 OID 17877)
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
-- TOC entry 228 (class 1259 OID 17876)
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
-- TOC entry 4988 (class 0 OID 0)
-- Dependencies: 228
-- Name: order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.order_items_id_seq OWNED BY public.order_items.id;


--
-- TOC entry 227 (class 1259 OID 17864)
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
    payment_status public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    shipping_name text NOT NULL,
    shipping_phone text NOT NULL,
    shipping_address text NOT NULL,
    note text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 17863)
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
-- TOC entry 4989 (class 0 OID 0)
-- Dependencies: 226
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- TOC entry 223 (class 1259 OID 17839)
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
-- TOC entry 222 (class 1259 OID 17838)
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
-- TOC entry 4990 (class 0 OID 0)
-- Dependencies: 222
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- TOC entry 221 (class 1259 OID 17829)
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
-- TOC entry 220 (class 1259 OID 17828)
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
-- TOC entry 4991 (class 0 OID 0)
-- Dependencies: 220
-- Name: sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sessions_id_seq OWNED BY public.sessions.id;


--
-- TOC entry 231 (class 1259 OID 17887)
-- Name: spaylater_customers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spaylater_customers (
    id integer NOT NULL,
    user_id integer NOT NULL,
    credit_limit numeric(12,2) DEFAULT 2000000 NOT NULL,
    available_credit numeric(12,2) DEFAULT 2000000 NOT NULL,
    used_credit numeric(12,2) DEFAULT 0 NOT NULL,
    total_paid numeric(12,2) DEFAULT 0 NOT NULL,
    total_overdue numeric(12,2) DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    kyc_status public."KYCStatus" DEFAULT 'PENDING'::public."KYCStatus" NOT NULL,
    bank_account text,
    bank_name text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.spaylater_customers OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 17886)
-- Name: spaylater_customers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spaylater_customers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.spaylater_customers_id_seq OWNER TO postgres;

--
-- TOC entry 4992 (class 0 OID 0)
-- Dependencies: 230
-- Name: spaylater_customers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spaylater_customers_id_seq OWNED BY public.spaylater_customers.id;


--
-- TOC entry 235 (class 1259 OID 17918)
-- Name: spaylater_payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spaylater_payments (
    id integer NOT NULL,
    transaction_id integer NOT NULL,
    customer_id integer NOT NULL,
    amount numeric(12,2) NOT NULL,
    payment_method text NOT NULL,
    payment_date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    metadata jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.spaylater_payments OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 17917)
-- Name: spaylater_payments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spaylater_payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.spaylater_payments_id_seq OWNER TO postgres;

--
-- TOC entry 4993 (class 0 OID 0)
-- Dependencies: 234
-- Name: spaylater_payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spaylater_payments_id_seq OWNED BY public.spaylater_payments.id;


--
-- TOC entry 233 (class 1259 OID 17904)
-- Name: spaylater_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spaylater_transactions (
    id integer NOT NULL,
    customer_id integer NOT NULL,
    order_id integer,
    amount numeric(12,2) NOT NULL,
    paid_amount numeric(12,2) DEFAULT 0 NOT NULL,
    purchase_date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    due_date timestamp(3) without time zone NOT NULL,
    status public."SPayLaterStatus" DEFAULT 'PENDING'::public."SPayLaterStatus" NOT NULL,
    late_fee numeric(12,2) DEFAULT 0 NOT NULL,
    metadata jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.spaylater_transactions OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 17903)
-- Name: spaylater_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spaylater_transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.spaylater_transactions_id_seq OWNER TO postgres;

--
-- TOC entry 4994 (class 0 OID 0)
-- Dependencies: 232
-- Name: spaylater_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spaylater_transactions_id_seq OWNED BY public.spaylater_transactions.id;


--
-- TOC entry 219 (class 1259 OID 17818)
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
    updated_at timestamp(3) without time zone NOT NULL,
    avatar text
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 17817)
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
-- TOC entry 4995 (class 0 OID 0)
-- Dependencies: 218
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4721 (class 2604 OID 17856)
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- TOC entry 4750 (class 2604 OID 18039)
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- TOC entry 4729 (class 2604 OID 17880)
-- Name: order_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq'::regclass);


--
-- TOC entry 4724 (class 2604 OID 17867)
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- TOC entry 4715 (class 2604 OID 17842)
-- Name: products id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- TOC entry 4713 (class 2604 OID 17832)
-- Name: sessions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions ALTER COLUMN id SET DEFAULT nextval('public.sessions_id_seq'::regclass);


--
-- TOC entry 4731 (class 2604 OID 17890)
-- Name: spaylater_customers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spaylater_customers ALTER COLUMN id SET DEFAULT nextval('public.spaylater_customers_id_seq'::regclass);


--
-- TOC entry 4746 (class 2604 OID 17921)
-- Name: spaylater_payments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spaylater_payments ALTER COLUMN id SET DEFAULT nextval('public.spaylater_payments_id_seq'::regclass);


--
-- TOC entry 4740 (class 2604 OID 17907)
-- Name: spaylater_transactions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spaylater_transactions ALTER COLUMN id SET DEFAULT nextval('public.spaylater_transactions_id_seq'::regclass);


--
-- TOC entry 4710 (class 2604 OID 17821)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 4958 (class 0 OID 17740)
-- Dependencies: 217
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
18d8fd27-392e-4ac3-9ae7-07be106a2f95	ad4ea7e7e4efeb3bf3a327c39e211979a23d29e0e40ca3993145b73da29878c5	2025-11-15 14:09:17.417158+07	20251115070917_add	\N	\N	2025-11-15 14:09:17.302926+07	1
\.


--
-- TOC entry 4966 (class 0 OID 17853)
-- Dependencies: 225
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, name, icon, color, description, is_active, created_at, updated_at) FROM stdin;
1	Điện thoại	phone-portrait	#EF4444	Smartphone và thiết bị di động	t	2025-11-15 08:26:57.838	2025-11-15 08:26:57.838
2	Laptop	laptop	#3B82F6	Máy tính xách tay	t	2025-11-15 08:26:57.853	2025-11-15 08:26:57.853
3	Tai nghe	headset	#10B981	Tai nghe và âm thanh	t	2025-11-15 08:26:57.855	2025-11-15 08:26:57.855
4	Đồng hồ	watch	#F59E0B	Đồng hồ thông minh và truyền thống	t	2025-11-15 08:26:57.856	2025-11-15 08:26:57.856
5	Máy ảnh	camera	#8B5CF6	Máy ảnh và phụ kiện	t	2025-11-15 08:26:57.858	2025-11-15 08:26:57.858
6	Phụ kiện	gift	#EC4899	Phụ kiện điện tử	t	2025-11-15 08:26:57.861	2025-11-15 08:26:57.861
19	Ô tô & Xe máy	car	#708090	Phụ tùng, phụ kiện, chăm sóc xe	t	2025-11-22 05:13:10.508	2025-11-22 05:13:10.508
7	Mỹ phẩm	brush-outline	#FF69B4	Sản phẩm chăm sóc da, trang điểm, mỹ phẩm	t	2025-11-22 05:13:10.508	2025-11-22 05:13:10.508
8	Gia vị & Thực phẩm khô	leaf	#FFA500	Gia vị nấu ăn, hạt, bột và thực phẩm khô	t	2025-11-22 05:13:10.508	2025-11-22 05:13:10.508
9	Quần áo	shirt-outline	#1E90FF	Thời trang nam nữ, áo, quần, váy	t	2025-11-22 05:13:10.508	2025-11-22 05:13:10.508
10	Giày dép	walk	#8B4513	Giày thể thao, giày da, dép	t	2025-11-22 05:13:10.508	2025-11-22 05:13:10.508
12	Đồ chơi trẻ em	game-controller-outline	#FFD700	Đồ chơi, giáo cụ, đồ chơi giáo dục cho trẻ	t	2025-11-22 05:13:10.508	2025-11-22 05:13:10.508
13	Sức khỏe & Dược phẩm	medkit	#DC143C	Thuốc không kê đơn, thực phẩm chức năng, chăm sóc sức khỏe	t	2025-11-22 05:13:10.508	2025-11-22 05:13:10.508
14	Thể thao & Dã ngoại	bicycle	#00CED1	Thiết bị thể thao, đồ dã ngoại, đi bộ, tập gym	t	2025-11-22 05:13:10.508	2025-11-22 05:13:10.508
15	Nội thất & Trang trí	home	#6A5ACD	Bàn ghế, giường, trang trí nhà	t	2025-11-22 05:13:10.508	2025-11-22 05:13:10.508
16	Văn phòng phẩm	pencil	#2E8B57	Bút, sổ, đồ dùng văn phòng	t	2025-11-22 05:13:10.508	2025-11-22 05:13:10.508
17	Thực phẩm & Đồ uống	cafe	#A0522D	Thực phẩm tươi, đồ uống, chế biến sẵn	t	2025-11-22 05:13:10.508	2025-11-22 05:13:10.508
18	Mẹ & Bé	accessibility-outline	#FFB6C1	Sữa, tã, đồ dùng cho mẹ và bé	t	2025-11-22 05:13:10.508	2025-11-22 05:13:10.508
20	Làm vườn & Ngoài trời	flower	#3CB371	Dụng cụ làm vườn, cây cảnh, phân bón	t	2025-11-22 05:13:10.508	2025-11-22 05:13:10.508
21	Điện gia dụng	flash	#4682B4	Thiết bị điện tử gia dụng: tủ lạnh, máy giặt, máy hút bụi	t	2025-11-22 05:13:10.508	2025-11-22 05:13:10.508
11	Đồ gia dụng & Nhà bếp	file-tray-stacked-outline	#32CD32	Dụng cụ nấu ăn, bếp, đồ dùng nhà bếp	t	2025-11-22 05:13:10.508	2025-11-22 05:13:10.508
\.


--
-- TOC entry 4978 (class 0 OID 18036)
-- Dependencies: 237
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, "userId", type, title, message, "actionUrl", "isRead", "createdAt") FROM stdin;
2	2	order	Đơn hàng mới	Bạn có đơn hàng mới #ORD1763981285386234	/orders/60	f	2025-11-24 10:48:05.404
1	1	order	Đơn hàng bị hủy	Đơn hàng #ORD1763741727352248 đã bị hủy.	/orders/57	t	2025-11-24 10:47:42.355
3	1	order	Cập nhật đơn hàng	Đơn hàng #ORD1763981285386234 đã được cập nhật: confirmed	/orders/60	f	2025-11-24 10:49:40.336
5	2	order	Đơn hàng mới	Bạn có đơn hàng mới #ORD1764038475872894	/orders/61	f	2025-11-25 02:41:15.896
6	2	order	Đơn hàng mới	Bạn có đơn hàng mới #ORD1764039537893066	/orders/62	f	2025-11-25 02:58:57.907
7	2	order	Đơn hàng mới	Bạn có đơn hàng mới #ORD1764040543968978	/orders/63	f	2025-11-25 03:15:43.981
4	1	order	Cập nhật đơn hàng	Đơn hàng #ORD1763981285386234 đã được cập nhật: shipping	/orders/60	t	2025-11-24 10:49:53.531
8	1	order	Cập nhật đơn hàng	Đơn hàng #ORD1764040543968978 đã được cập nhật: confirmed	/orders/63	f	2025-11-26 15:50:15.256
9	2	order	Đơn hàng mới	Bạn có đơn hàng mới #ORD1764172534499378	/orders/64	f	2025-11-26 15:55:34.524
10	4	order	Đơn hàng mới	Bạn có đơn hàng mới #ORD1764172534499378	/orders/64	f	2025-11-26 15:55:34.527
\.


--
-- TOC entry 4970 (class 0 OID 17877)
-- Dependencies: 229
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_items (id, order_id, product_id, seller_id, product_name, price, quantity, subtotal, image, created_at) FROM stdin;
1	1	1	2	iPhone 16 128GB | Chính hãng VN/A	20990000.00	1	20990000.00	https://res.cloudinary.com/dnui1a2v5/image/upload/v1763195342/ecomira/products/fxppep8s71untkc3ay5t.jpg	2025-11-18 12:39:01.429
2	2	2	2	Nước Tẩy Trang làm sạch sâu dịu nhẹ cho mọi loại da - Garnier Micellar Cleansing Water 400ml	155000.00	1	155000.00	https://res.cloudinary.com/dnui1a2v5/image/upload/v1763474528/ecomira/products/xrfl5gh4tyl8ozhohbso.jpg	2025-11-18 15:05:04.43
3	3	2	2	Nước Tẩy Trang làm sạch sâu dịu nhẹ cho mọi loại da - Garnier Micellar Cleansing Water 400ml	155000.00	2	310000.00	https://res.cloudinary.com/dnui1a2v5/image/upload/v1763474528/ecomira/products/xrfl5gh4tyl8ozhohbso.jpg	2025-11-18 16:08:13.965
4	4	2	2	Nước Tẩy Trang làm sạch sâu dịu nhẹ cho mọi loại da - Garnier Micellar Cleansing Water 400ml	155000.00	1	155000.00	https://res.cloudinary.com/dnui1a2v5/image/upload/v1763474528/ecomira/products/xrfl5gh4tyl8ozhohbso.jpg	2025-11-19 02:16:58.63
5	5	2	2	Nước Tẩy Trang làm sạch sâu dịu nhẹ cho mọi loại da - Garnier Micellar Cleansing Water 400ml	155000.00	1	155000.00	https://res.cloudinary.com/dnui1a2v5/image/upload/v1763474528/ecomira/products/xrfl5gh4tyl8ozhohbso.jpg	2025-11-19 02:45:13.818
6	6	2	2	Nước Tẩy Trang làm sạch sâu dịu nhẹ cho mọi loại da - Garnier Micellar Cleansing Water 400ml	155000.00	1	155000.00	https://res.cloudinary.com/dnui1a2v5/image/upload/v1763474528/ecomira/products/xrfl5gh4tyl8ozhohbso.jpg	2025-11-19 02:51:12.191
7	7	2	2	Nước Tẩy Trang làm sạch sâu dịu nhẹ cho mọi loại da - Garnier Micellar Cleansing Water 400ml	155000.00	1	155000.00	https://res.cloudinary.com/dnui1a2v5/image/upload/v1763474528/ecomira/products/xrfl5gh4tyl8ozhohbso.jpg	2025-11-19 03:17:51.78
8	8	2	2	Nước Tẩy Trang làm sạch sâu dịu nhẹ cho mọi loại da - Garnier Micellar Cleansing Water 400ml	155000.00	1	155000.00	https://res.cloudinary.com/dnui1a2v5/image/upload/v1763474528/ecomira/products/xrfl5gh4tyl8ozhohbso.jpg	2025-11-19 03:59:35.914
9	9	2	2	Nước Tẩy Trang làm sạch sâu dịu nhẹ cho mọi loại da - Garnier Micellar Cleansing Water 400ml	155000.00	1	155000.00	https://res.cloudinary.com/dnui1a2v5/image/upload/v1763474528/ecomira/products/xrfl5gh4tyl8ozhohbso.jpg	2025-11-20 03:17:15.722
10	10	2	2	Nước Tẩy Trang làm sạch sâu dịu nhẹ cho mọi loại da - Garnier Micellar Cleansing Water 400ml	155000.00	1	155000.00	https://res.cloudinary.com/dnui1a2v5/image/upload/v1763474528/ecomira/products/xrfl5gh4tyl8ozhohbso.jpg	2025-11-20 03:22:00.315
11	11	2	2	Nước Tẩy Trang làm sạch sâu dịu nhẹ cho mọi loại da - Garnier Micellar Cleansing Water 400ml	155000.00	1	155000.00	https://res.cloudinary.com/dnui1a2v5/image/upload/v1763474528/ecomira/products/xrfl5gh4tyl8ozhohbso.jpg	2025-11-20 03:25:30.677
12	12	2	2	Nước Tẩy Trang làm sạch sâu dịu nhẹ cho mọi loại da - Garnier Micellar Cleansing Water 400ml	155000.00	1	155000.00	https://res.cloudinary.com/dnui1a2v5/image/upload/v1763474528/ecomira/products/xrfl5gh4tyl8ozhohbso.jpg	2025-11-20 03:26:13.261
13	13	2	2	Nước Tẩy Trang làm sạch sâu dịu nhẹ cho mọi loại da - Garnier Micellar Cleansing Water 400ml	155000.00	1	155000.00	https://res.cloudinary.com/dnui1a2v5/image/upload/v1763474528/ecomira/products/xrfl5gh4tyl8ozhohbso.jpg	2025-11-20 03:28:02.102
14	14	2	2	Nước Tẩy Trang làm sạch sâu dịu nhẹ cho mọi loại da - Garnier Micellar Cleansing Water 400ml	155000.00	1	155000.00	https://res.cloudinary.com/dnui1a2v5/image/upload/v1763474528/ecomira/products/xrfl5gh4tyl8ozhohbso.jpg	2025-11-20 08:42:15.112
15	15	1	2	iPhone 16 128GB | Chính hãng VN/A	20990000.00	1	20990000.00	https://res.cloudinary.com/dnui1a2v5/image/upload/v1763195342/ecomira/products/fxppep8s71untkc3ay5t.jpg	2025-11-20 09:11:32.245
16	16	2	2	Nước Tẩy Trang làm sạch sâu dịu nhẹ cho mọi loại da - Garnier Micellar Cleansing Water 400ml	155000.00	1	155000.00	https://res.cloudinary.com/dnui1a2v5/image/upload/v1763474528/ecomira/products/xrfl5gh4tyl8ozhohbso.jpg	2025-11-20 09:12:37.353
17	17	2	2	Nước Tẩy Trang làm sạch sâu dịu nhẹ cho mọi loại da - Garnier Micellar Cleansing Water 400ml	155000.00	1	155000.00	https://res.cloudinary.com/dnui1a2v5/image/upload/v1763474528/ecomira/products/xrfl5gh4tyl8ozhohbso.jpg	2025-11-20 09:20:40.684
18	18	2	2	Nước Tẩy Trang làm sạch sâu dịu nhẹ cho mọi loại da - Garnier Micellar Cleansing Water 400ml	155000.00	1	155000.00	https://res.cloudinary.com/dnui1a2v5/image/upload/v1763474528/ecomira/products/xrfl5gh4tyl8ozhohbso.jpg	2025-11-20 09:22:41.335
19	19	2	2	Nước Tẩy Trang làm sạch sâu dịu nhẹ cho mọi loại da - Garnier Micellar Cleansing Water 400ml	155000.00	1	155000.00	https://res.cloudinary.com/dnui1a2v5/image/upload/v1763474528/ecomira/products/xrfl5gh4tyl8ozhohbso.jpg	2025-11-20 09:28:08.87
20	20	2	2	Nước Tẩy Trang làm sạch sâu dịu nhẹ cho mọi loại da - Garnier Micellar Cleansing Water 400ml	155000.00	1	155000.00	https://res.cloudinary.com/dnui1a2v5/image/upload/v1763474528/ecomira/products/xrfl5gh4tyl8ozhohbso.jpg	2025-11-20 10:12:27.024
21	21	2	2	Nước Tẩy Trang làm sạch sâu dịu nhẹ cho mọi loại da - Garnier Micellar Cleansing Water 400ml	155000.00	1	155000.00	https://res.cloudinary.com/dnui1a2v5/image/upload/v1763474528/ecomira/products/xrfl5gh4tyl8ozhohbso.jpg	2025-11-20 10:14:07.123
22	22	2	2	Nước Tẩy Trang làm sạch sâu dịu nhẹ cho mọi loại da - Garnier Micellar Cleansing Water 400ml	155000.00	1	155000.00	https://res.cloudinary.com/dnui1a2v5/image/upload/v1763474528/ecomira/products/xrfl5gh4tyl8ozhohbso.jpg	2025-11-20 10:14:44.564
23	23	2	2	Nước Tẩy Trang làm sạch sâu dịu nhẹ cho mọi loại da - Garnier Micellar Cleansing Water 400ml	155000.00	1	155000.00	https://res.cloudinary.com/dnui1a2v5/image/upload/v1763474528/ecomira/products/xrfl5gh4tyl8ozhohbso.jpg	2025-11-20 14:16:26.316
24	24	2	2	Nước Tẩy Trang làm sạch sâu dịu nhẹ cho mọi loại da - Garnier Micellar Cleansing Water 400ml	155000.00	1	155000.00	https://res.cloudinary.com/dnui1a2v5/image/upload/v1763474528/ecomira/products/xrfl5gh4tyl8ozhohbso.jpg	2025-11-20 14:23:11.281
25	25	2	2	Nước Tẩy Trang làm sạch sâu dịu nhẹ cho mọi loại da - Garnier Micellar Cleansing Water 400ml	155000.00	1	155000.00	https://res.cloudinary.com/dnui1a2v5/image/upload/v1763474528/ecomira/products/xrfl5gh4tyl8ozhohbso.jpg	2025-11-20 14:23:58.383
26	26	2	2	Nước Tẩy Trang làm sạch sâu dịu nhẹ cho mọi loại da - Garnier Micellar Cleansing Water 400ml	155000.00	1	155000.00	https://res.cloudinary.com/dnui1a2v5/image/upload/v1763474528/ecomira/products/xrfl5gh4tyl8ozhohbso.jpg	2025-11-20 14:24:51.433
27	27	2	2	Nước Tẩy Trang làm sạch sâu dịu nhẹ cho mọi loại da - Garnier Micellar Cleansing Water 400ml	155000.00	1	155000.00	https://res.cloudinary.com/dnui1a2v5/image/upload/v1763474528/ecomira/products/xrfl5gh4tyl8ozhohbso.jpg	2025-11-20 14:29:16.996
28	28	2	2	Nước Tẩy Trang làm sạch sâu dịu nhẹ cho mọi loại da - Garnier Micellar Cleansing Water 400ml	155000.00	1	155000.00	https://res.cloudinary.com/dnui1a2v5/image/upload/v1763474528/ecomira/products/xrfl5gh4tyl8ozhohbso.jpg	2025-11-20 14:32:33.272
29	29	2	2	Nước Tẩy Trang làm sạch sâu dịu nhẹ cho mọi loại da - Garnier Micellar Cleansing Water 400ml	155000.00	1	155000.00	https://res.cloudinary.com/dnui1a2v5/image/upload/v1763474528/ecomira/products/xrfl5gh4tyl8ozhohbso.jpg	2025-11-20 14:35:14.132
30	30	2	2	Nước Tẩy Trang làm sạch sâu dịu nhẹ cho mọi loại da - Garnier Micellar Cleansing Water 400ml	155000.00	1	155000.00	https://res.cloudinary.com/dnui1a2v5/image/upload/v1763474528/ecomira/products/xrfl5gh4tyl8ozhohbso.jpg	2025-11-20 14:44:04.313
31	31	2	2	Nước Tẩy Trang làm sạch sâu dịu nhẹ cho mọi loại da - Garnier Micellar Cleansing Water 400ml	155000.00	1	155000.00	https://res.cloudinary.com/dnui1a2v5/image/upload/v1763474528/ecomira/products/xrfl5gh4tyl8ozhohbso.jpg	2025-11-20 14:50:13.957
32	32	2	2	Nước Tẩy Trang làm sạch sâu dịu nhẹ cho mọi loại da - Garnier Micellar Cleansing Water 400ml	155000.00	1	155000.00	https://res.cloudinary.com/dnui1a2v5/image/upload/v1763474528/ecomira/products/xrfl5gh4tyl8ozhohbso.jpg	2025-11-20 15:03:08.358
33	33	2	2	Nước Tẩy Trang làm sạch sâu dịu nhẹ cho mọi loại da - Garnier Micellar Cleansing Water 400ml	155000.00	1	155000.00	https://res.cloudinary.com/dnui1a2v5/image/upload/v1763474528/ecomira/products/xrfl5gh4tyl8ozhohbso.jpg	2025-11-20 15:24:12.853
34	34	2	2	Nước Tẩy Trang làm sạch sâu dịu nhẹ cho mọi loại da - Garnier Micellar Cleansing Water 400ml	155000.00	1	155000.00	https://res.cloudinary.com/dnui1a2v5/image/upload/v1763474528/ecomira/products/xrfl5gh4tyl8ozhohbso.jpg	2025-11-20 15:32:32.768
35	35	2	2	Nước Tẩy Trang làm sạch sâu dịu nhẹ cho mọi loại da - Garnier Micellar Cleansing Water 400ml	155000.00	1	155000.00	https://res.cloudinary.com/dnui1a2v5/image/upload/v1763474528/ecomira/products/xrfl5gh4tyl8ozhohbso.jpg	2025-11-20 15:36:11.098
36	36	2	2	Nước Tẩy Trang làm sạch sâu dịu nhẹ cho mọi loại da - Garnier Micellar Cleansing Water 400ml	155000.00	1	155000.00	https://res.cloudinary.com/dnui1a2v5/image/upload/v1763474528/ecomira/products/xrfl5gh4tyl8ozhohbso.jpg	2025-11-20 15:40:26.31
37	37	2	2	Nước Tẩy Trang làm sạch sâu dịu nhẹ cho mọi loại da - Garnier Micellar Cleansing Water 400ml	155000.00	1	155000.00	https://res.cloudinary.com/dnui1a2v5/image/upload/v1763474528/ecomira/products/xrfl5gh4tyl8ozhohbso.jpg	2025-11-20 15:55:40.406
38	38	2	2	Nước Tẩy Trang làm sạch sâu dịu nhẹ cho mọi loại da - Garnier Micellar Cleansing Water 400ml	155000.00	1	155000.00	https://res.cloudinary.com/dnui1a2v5/image/upload/v1763474528/ecomira/products/xrfl5gh4tyl8ozhohbso.jpg	2025-11-20 16:00:53.22
39	39	2	2	Nước Tẩy Trang làm sạch sâu dịu nhẹ cho mọi loại da - Garnier Micellar Cleansing Water 400ml	155000.00	1	155000.00	https://res.cloudinary.com/dnui1a2v5/image/upload/v1763474528/ecomira/products/xrfl5gh4tyl8ozhohbso.jpg	2025-11-20 16:02:37.555
40	40	2	2	Nước Tẩy Trang làm sạch sâu dịu nhẹ cho mọi loại da - Garnier Micellar Cleansing Water 400ml	155000.00	1	155000.00	https://res.cloudinary.com/dnui1a2v5/image/upload/v1763474528/ecomira/products/xrfl5gh4tyl8ozhohbso.jpg	2025-11-20 16:16:02.42
41	41	2	2	Nước Tẩy Trang làm sạch sâu dịu nhẹ cho mọi loại da - Garnier Micellar Cleansing Water 400ml	155000.00	1	155000.00	https://res.cloudinary.com/dnui1a2v5/image/upload/v1763474528/ecomira/products/xrfl5gh4tyl8ozhohbso.jpg	2025-11-20 16:19:49.34
42	42	2	2	Nước Tẩy Trang làm sạch sâu dịu nhẹ cho mọi loại da - Garnier Micellar Cleansing Water 400ml	155000.00	1	155000.00	https://res.cloudinary.com/dnui1a2v5/image/upload/v1763474528/ecomira/products/xrfl5gh4tyl8ozhohbso.jpg	2025-11-20 16:24:10.601
43	43	2	2	Nước Tẩy Trang làm sạch sâu dịu nhẹ cho mọi loại da - Garnier Micellar Cleansing Water 400ml	155000.00	1	155000.00	https://res.cloudinary.com/dnui1a2v5/image/upload/v1763474528/ecomira/products/xrfl5gh4tyl8ozhohbso.jpg	2025-11-21 14:40:15.303
44	44	2	2	Nước Tẩy Trang làm sạch sâu dịu nhẹ cho mọi loại da - Garnier Micellar Cleansing Water 400ml	155000.00	1	155000.00	https://res.cloudinary.com/dnui1a2v5/image/upload/v1763474528/ecomira/products/xrfl5gh4tyl8ozhohbso.jpg	2025-11-21 15:12:40.856
45	45	2	2	Nước Tẩy Trang làm sạch sâu dịu nhẹ cho mọi loại da - Garnier Micellar Cleansing Water 400ml	155000.00	1	155000.00	https://res.cloudinary.com/dnui1a2v5/image/upload/v1763474528/ecomira/products/xrfl5gh4tyl8ozhohbso.jpg	2025-11-21 15:26:06.455
46	46	2	2	Nước Tẩy Trang làm sạch sâu dịu nhẹ cho mọi loại da - Garnier Micellar Cleansing Water 400ml	155000.00	1	155000.00	https://res.cloudinary.com/dnui1a2v5/image/upload/v1763474528/ecomira/products/xrfl5gh4tyl8ozhohbso.jpg	2025-11-21 15:27:35.602
47	47	2	2	Nước Tẩy Trang làm sạch sâu dịu nhẹ cho mọi loại da - Garnier Micellar Cleansing Water 400ml	155000.00	1	155000.00	https://res.cloudinary.com/dnui1a2v5/image/upload/v1763474528/ecomira/products/xrfl5gh4tyl8ozhohbso.jpg	2025-11-21 15:34:43.425
48	48	2	2	Nước Tẩy Trang làm sạch sâu dịu nhẹ cho mọi loại da - Garnier Micellar Cleansing Water 400ml	155000.00	1	155000.00	https://res.cloudinary.com/dnui1a2v5/image/upload/v1763474528/ecomira/products/xrfl5gh4tyl8ozhohbso.jpg	2025-11-21 15:42:27.069
49	49	2	2	Nước Tẩy Trang làm sạch sâu dịu nhẹ cho mọi loại da - Garnier Micellar Cleansing Water 400ml	155000.00	1	155000.00	https://res.cloudinary.com/dnui1a2v5/image/upload/v1763474528/ecomira/products/xrfl5gh4tyl8ozhohbso.jpg	2025-11-21 15:43:43.465
50	50	2	2	Nước Tẩy Trang làm sạch sâu dịu nhẹ cho mọi loại da - Garnier Micellar Cleansing Water 400ml	155000.00	1	155000.00	https://res.cloudinary.com/dnui1a2v5/image/upload/v1763474528/ecomira/products/xrfl5gh4tyl8ozhohbso.jpg	2025-11-21 15:52:48.289
51	51	2	2	Nước Tẩy Trang làm sạch sâu dịu nhẹ cho mọi loại da - Garnier Micellar Cleansing Water 400ml	155000.00	1	155000.00	https://res.cloudinary.com/dnui1a2v5/image/upload/v1763474528/ecomira/products/xrfl5gh4tyl8ozhohbso.jpg	2025-11-21 15:58:45.695
52	52	2	2	Nước Tẩy Trang làm sạch sâu dịu nhẹ cho mọi loại da - Garnier Micellar Cleansing Water 400ml	155000.00	1	155000.00	https://res.cloudinary.com/dnui1a2v5/image/upload/v1763474528/ecomira/products/xrfl5gh4tyl8ozhohbso.jpg	2025-11-21 15:59:58.466
53	53	2	2	Nước Tẩy Trang làm sạch sâu dịu nhẹ cho mọi loại da - Garnier Micellar Cleansing Water 400ml	155000.00	1	155000.00	https://res.cloudinary.com/dnui1a2v5/image/upload/v1763474528/ecomira/products/xrfl5gh4tyl8ozhohbso.jpg	2025-11-21 16:01:58.333
54	54	2	2	Nước Tẩy Trang làm sạch sâu dịu nhẹ cho mọi loại da - Garnier Micellar Cleansing Water 400ml	155000.00	1	155000.00	https://res.cloudinary.com/dnui1a2v5/image/upload/v1763474528/ecomira/products/xrfl5gh4tyl8ozhohbso.jpg	2025-11-21 16:02:17.13
55	55	2	2	Nước Tẩy Trang làm sạch sâu dịu nhẹ cho mọi loại da - Garnier Micellar Cleansing Water 400ml	155000.00	1	155000.00	https://res.cloudinary.com/dnui1a2v5/image/upload/v1763474528/ecomira/products/xrfl5gh4tyl8ozhohbso.jpg	2025-11-21 16:11:47.545
56	56	2	2	Nước Tẩy Trang làm sạch sâu dịu nhẹ cho mọi loại da - Garnier Micellar Cleansing Water 400ml	155000.00	1	155000.00	https://res.cloudinary.com/dnui1a2v5/image/upload/v1763474528/ecomira/products/xrfl5gh4tyl8ozhohbso.jpg	2025-11-21 16:14:32.77
57	57	2	2	Nước Tẩy Trang làm sạch sâu dịu nhẹ cho mọi loại da - Garnier Micellar Cleansing Water 400ml	155000.00	1	155000.00	https://res.cloudinary.com/dnui1a2v5/image/upload/v1763474528/ecomira/products/xrfl5gh4tyl8ozhohbso.jpg	2025-11-21 16:15:27.354
58	58	2	2	Nước Tẩy Trang làm sạch sâu dịu nhẹ cho mọi loại da - Garnier Micellar Cleansing Water 400ml	155000.00	1	155000.00	https://res.cloudinary.com/dnui1a2v5/image/upload/v1763474528/ecomira/products/xrfl5gh4tyl8ozhohbso.jpg	2025-11-21 16:19:42.329
59	59	2	2	Nước Tẩy Trang làm sạch sâu dịu nhẹ cho mọi loại da - Garnier Micellar Cleansing Water 400ml	155000.00	1	155000.00	https://res.cloudinary.com/dnui1a2v5/image/upload/v1763474528/ecomira/products/xrfl5gh4tyl8ozhohbso.jpg	2025-11-21 16:21:57.185
60	60	2	2	Nước Tẩy Trang làm sạch sâu dịu nhẹ cho mọi loại da - Garnier Micellar Cleansing Water 400ml	155000.00	1	155000.00	https://res.cloudinary.com/dnui1a2v5/image/upload/v1763474528/ecomira/products/xrfl5gh4tyl8ozhohbso.jpg	2025-11-24 10:48:05.389
61	61	2	2	Nước Tẩy Trang làm sạch sâu dịu nhẹ cho mọi loại da - Garnier Micellar Cleansing Water 400ml	155000.00	1	155000.00	https://res.cloudinary.com/dnui1a2v5/image/upload/v1763474528/ecomira/products/xrfl5gh4tyl8ozhohbso.jpg	2025-11-25 02:41:15.875
62	62	2	2	Nước Tẩy Trang làm sạch sâu dịu nhẹ cho mọi loại da - Garnier Micellar Cleansing Water 400ml	155000.00	1	155000.00	https://res.cloudinary.com/dnui1a2v5/image/upload/v1763474528/ecomira/products/xrfl5gh4tyl8ozhohbso.jpg	2025-11-25 02:58:57.894
63	63	2	2	Nước Tẩy Trang làm sạch sâu dịu nhẹ cho mọi loại da - Garnier Micellar Cleansing Water 400ml	155000.00	1	155000.00	https://res.cloudinary.com/dnui1a2v5/image/upload/v1763474528/ecomira/products/xrfl5gh4tyl8ozhohbso.jpg	2025-11-25 03:15:43.969
64	64	2	2	Nước Tẩy Trang làm sạch sâu dịu nhẹ cho mọi loại da - Garnier Micellar Cleansing Water 400ml	159000.00	1	159000.00	https://res.cloudinary.com/dnui1a2v5/image/upload/v1763474528/ecomira/products/xrfl5gh4tyl8ozhohbso.jpg	2025-11-26 15:55:34.501
65	64	3	4	Áo Thun Nữ Ôm Body JUSTDUN B18 Cổ Tròn Tay Ngắn, Cotton Lông Mịn Co Giãn 4 Chiều, Mềm Mại Thoáng Khí	65000.00	1	65000.00	https://res.cloudinary.com/dnui1a2v5/image/upload/v1764171071/ecomira/products/gzoa7zsdlpft1kd0qssi.jpg	2025-11-26 15:55:34.501
\.


--
-- TOC entry 4968 (class 0 OID 17864)
-- Dependencies: 227
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, order_number, customer_id, total_amount, shipping_fee, status, payment_method, payment_status, shipping_name, shipping_phone, shipping_address, note, created_at, updated_at) FROM stdin;
1	ORD1763469541426013	1	21020000.00	30000.00	confirmed	cod	PENDING	nhithao	0348990415	450 tran dai nghia, ngu hanh son, thanh pho da nang		2025-11-18 12:39:01.429	2025-11-18 12:43:07.967
2	ORD1763478304427363	1	185000.00	30000.00	pending	spaylater	PENDING	nhithao	0348990415	450 tran dai nghia, ngu hanh son, thanh pho da nang		2025-11-18 15:05:04.43	2025-11-18 15:05:04.43
38	ORD1763654453218625	3	185000.00	30000.00	pending	momo	PENDING	Phi Quan	0983823489	470 tran dai nghia, da nang		2025-11-20 16:00:53.22	2025-11-20 16:00:53.22
3	ORD1763482093963512	1	340000.00	30000.00	pending	spaylater	PENDING	nhithao	0348990415	450 tran dai nghia, ngu hanh son, thanh pho da nang		2025-10-23 16:08:13.965	2025-11-18 16:08:13.965
4	ORD1763518618629498	3	185000.00	30000.00	pending	spaylater	PENDING	Phi Quan	0983823489	470 tran dai nghia, da nang		2025-11-19 02:16:58.63	2025-11-19 02:16:58.63
5	ORD1763520313817503	3	185000.00	30000.00	pending	spaylater	PENDING	Phi Quan	0983823489	470 tran dai nghia, da nang		2025-11-19 02:45:13.818	2025-11-19 02:45:13.818
6	ORD1763520672190180	3	185000.00	30000.00	pending	spaylater	PENDING	Phi Quan	0983823489	470 tran dai nghia, da nang		2025-11-19 02:51:12.191	2025-11-19 02:51:12.191
39	ORD1763654557553604	3	185000.00	30000.00	pending	momo	PENDING	Phi Quan	0983823489	470 tran dai nghia, da nang		2025-11-20 16:02:37.555	2025-11-20 16:02:37.555
40	ORD1763655362418919	3	185000.00	30000.00	pending	momo	PENDING	Phi Quan	0983823489	470 tran dai nghia, da nang		2025-11-20 16:16:02.42	2025-11-20 16:16:02.42
7	ORD1763522271779419	1	185000.00	30000.00	pending	spaylater	PENDING	nhithao	0348990415	450 tran dai nghia, ngu hanh son, thanh pho da nang		2025-10-19 03:17:51.78	2025-10-19 03:17:52.018
8	ORD1763524775912266	3	185000.00	30000.00	pending	spaylater	PENDING	Phi Quan	0983823489	470 tran dai nghia, da nang		2025-11-19 03:59:35.914	2025-11-19 03:59:36.192
9	ORD1763608635719288	1	185000.00	30000.00	pending	momo	PENDING	nhithao	0348990415	450 tran dai nghia, ngu hanh son, thanh pho da nang		2025-11-20 03:17:15.722	2025-11-20 03:17:15.722
10	ORD1763608920313031	1	185000.00	30000.00	pending	momo	PENDING	nhithao	0348990415	450 tran dai nghia, ngu hanh son, thanh pho da nang		2025-11-20 03:22:00.315	2025-11-20 03:22:00.315
11	ORD1763609130675892	1	185000.00	30000.00	pending	momo	PENDING	nhithao	0348990415	450 tran dai nghia, ngu hanh son, thanh pho da nang		2025-11-20 03:25:30.677	2025-11-20 03:25:30.677
12	ORD1763609173259312	1	185000.00	30000.00	pending	momo	PENDING	nhithao	0348990415	450 tran dai nghia, ngu hanh son, thanh pho da nang		2025-11-20 03:26:13.261	2025-11-20 03:26:13.261
14	ORD1763628135109973	1	185000.00	30000.00	cancelled	momo	PENDING	nhithao	0348990415	450 tran dai nghia, ngu hanh son, thanh pho da nang		2025-11-20 08:42:15.112	2025-11-20 09:10:57.209
13	ORD1763609282101055	1	185000.00	30000.00	cancelled	momo	PENDING	nhithao	0348990415	450 tran dai nghia, ngu hanh son, thanh pho da nang		2025-11-20 03:28:02.102	2025-11-20 09:11:08.893
15	ORD1763629892244367	1	21020000.00	30000.00	pending	momo	PENDING	nhithao	0348990415	450 tran dai nghia, ngu hanh son, thanh pho da nang		2025-11-20 09:11:32.245	2025-11-20 09:11:32.245
16	ORD1763629957351468	1	185000.00	30000.00	pending	momo	PENDING	nhithao	0348990415	450 tran dai nghia, ngu hanh son, thanh pho da nang		2025-11-20 09:12:37.353	2025-11-20 09:12:37.353
17	ORD1763630440682710	1	185000.00	30000.00	pending	momo	PENDING	nhithao	0348990415	450 tran dai nghia, ngu hanh son, thanh pho da nang		2025-11-20 09:20:40.684	2025-11-20 09:20:40.684
18	ORD1763630561331436	1	185000.00	30000.00	pending	momo	PENDING	nhithao	0348990415	450 tran dai nghia, ngu hanh son, thanh pho da nang		2025-11-20 09:22:41.335	2025-11-20 09:22:41.335
19	ORD1763630888868709	1	185000.00	30000.00	pending	momo	PENDING	nhithao	0348990415	450 tran dai nghia, ngu hanh son, thanh pho da nang		2025-11-20 09:28:08.87	2025-11-20 09:28:08.87
20	ORD1763633547021104	1	185000.00	30000.00	pending	momo	PENDING	nhithao	0348990415	450 tran dai nghia, ngu hanh son, thanh pho da nang		2025-11-20 10:12:27.024	2025-11-20 10:12:27.024
21	ORD1763633647121314	3	185000.00	30000.00	pending	momo	PENDING	Phi Quan	0983823489	470 tran dai nghia, da nang		2025-11-20 10:14:07.123	2025-11-20 10:14:07.123
22	ORD1763633684562594	3	185000.00	30000.00	pending	momo	PENDING	Phi Quan	0983823489	470 tran dai nghia, da nang		2025-11-20 10:14:44.564	2025-11-20 10:14:44.564
23	ORD1763648186310597	3	185000.00	30000.00	pending	momo	PENDING	Phi Quan	0983823489	470 tran dai nghia, da nang		2025-11-20 14:16:26.316	2025-11-20 14:16:26.316
24	ORD1763648591279998	3	185000.00	30000.00	pending	momo	PENDING	Phi Quan	0983823489	470 tran dai nghia, da nang		2025-11-20 14:23:11.281	2025-11-20 14:23:11.281
25	ORD1763648638381262	1	185000.00	30000.00	pending	momo	PENDING	nhithao	0348990415	450 tran dai nghia, ngu hanh son, thanh pho da nang		2025-11-20 14:23:58.383	2025-11-20 14:23:58.383
26	ORD1763648691431290	3	185000.00	30000.00	pending	momo	PENDING	Phi Quan	0983823489	470 tran dai nghia, da nang		2025-11-20 14:24:51.433	2025-11-20 14:24:51.433
27	ORD1763648956994764	3	185000.00	30000.00	pending	momo	PENDING	Phi Quan	0983823489	470 tran dai nghia, da nang		2025-11-20 14:29:16.996	2025-11-20 14:29:16.996
28	ORD1763649153270709	3	185000.00	30000.00	pending	momo	PENDING	Phi Quan	0983823489	470 tran dai nghia, da nang		2025-11-20 14:32:33.272	2025-11-20 14:32:33.272
29	ORD1763649314129069	3	185000.00	30000.00	pending	momo	PENDING	Phi Quan	0983823489	470 tran dai nghia, da nang		2025-11-20 14:35:14.132	2025-11-20 14:35:14.132
30	ORD1763649844311139	3	185000.00	30000.00	pending	momo	PENDING	Phi Quan	0983823489	470 tran dai nghia, da nang		2025-11-20 14:44:04.313	2025-11-20 14:44:04.313
31	ORD1763650213955246	3	185000.00	30000.00	pending	momo	PENDING	Phi Quan	0983823489	470 tran dai nghia, da nang		2025-11-20 14:50:13.957	2025-11-20 14:50:13.957
32	ORD1763650988356077	1	185000.00	30000.00	pending	momo	PENDING	nhithao	0348990415	450 tran dai nghia, ngu hanh son, thanh pho da nang		2025-11-20 15:03:08.358	2025-11-20 15:03:08.358
33	ORD1763652252851887	3	185000.00	30000.00	pending	momo	PENDING	Phi Quan	0983823489	470 tran dai nghia, da nang		2025-11-20 15:24:12.853	2025-11-20 15:24:12.853
34	ORD1763652752763728	3	185000.00	30000.00	pending	momo	PENDING	Phi Quan	0983823489	470 tran dai nghia, da nang		2025-11-20 15:32:32.768	2025-11-20 15:32:32.768
35	ORD1763652971096734	3	185000.00	30000.00	pending	momo	PENDING	Phi Quan	0983823489	470 tran dai nghia, da nang		2025-11-20 15:36:11.098	2025-11-20 15:36:11.098
36	ORD1763653226308562	3	185000.00	30000.00	pending	momo	PENDING	Phi Quan	0983823489	470 tran dai nghia, da nang		2025-11-20 15:40:26.31	2025-11-20 15:40:26.31
37	ORD1763654140403637	3	185000.00	30000.00	pending	momo	PENDING	Phi Quan	0983823489	470 tran dai nghia, da nang		2025-11-20 15:55:40.406	2025-11-20 15:55:40.406
41	ORD1763655589338478	3	185000.00	30000.00	pending	momo	PENDING	Phi Quan	0983823489	470 tran dai nghia, da nang		2025-11-20 16:19:49.34	2025-11-20 16:19:49.34
42	ORD1763655850599051	3	185000.00	30000.00	pending	momo	PENDING	Phi Quan	0983823489	470 tran dai nghia, da nang		2025-11-20 16:24:10.601	2025-11-20 16:24:10.601
43	ORD1763736015301092	3	185000.00	30000.00	pending	momo	PENDING	Phi Quan	0983823489	470 tran dai nghia, da nang		2025-11-21 14:40:15.303	2025-11-21 14:40:15.303
44	ORD1763737960853668	3	185000.00	30000.00	pending	momo	PENDING	Phi Quan	0983823489	470 tran dai nghia, da nang		2025-11-21 15:12:40.856	2025-11-21 15:12:40.856
45	ORD1763738766453622	3	185000.00	30000.00	pending	momo	PENDING	Phi Quan	0983823489	470 tran dai nghia, da nang		2025-11-21 15:26:06.455	2025-11-21 15:26:06.455
46	ORD1763738855600401	3	185000.00	30000.00	pending	momo	PENDING	Phi Quan	0983823489	470 tran dai nghia, da nang		2025-11-21 15:27:35.602	2025-11-21 15:27:35.602
47	ORD1763739283421438	3	185000.00	30000.00	pending	momo	PENDING	Phi Quan	0983823489	470 tran dai nghia, da nang		2025-11-21 15:34:43.425	2025-11-21 15:34:43.425
48	ORD1763739747067941	3	185000.00	30000.00	pending	momo	PENDING	Phi Quan	0983823489	470 tran dai nghia, da nang		2025-11-21 15:42:27.069	2025-11-21 15:42:27.069
49	ORD1763739823463489	3	185000.00	30000.00	pending	momo	PENDING	Phi Quan	0983823489	470 tran dai nghia, da nang		2025-11-21 15:43:43.465	2025-11-21 15:43:43.465
50	ORD1763740368287596	3	185000.00	30000.00	pending	momo	PENDING	Phi Quan	0983823489	470 tran dai nghia, da nang		2025-11-21 15:52:48.289	2025-11-21 15:52:48.289
51	ORD1763740725693548	3	185000.00	30000.00	pending	cod	PENDING	Phi Quan	0983823489	470 tran dai nghia, da nang		2025-11-21 15:58:45.695	2025-11-21 15:58:45.695
52	ORD1763740798464187	3	185000.00	30000.00	pending	momo	PENDING	Phi Quan	0983823489	470 tran dai nghia, da nang		2025-11-21 15:59:58.466	2025-11-21 15:59:58.466
53	ORD1763740918330681	3	185000.00	30000.00	pending	momo	PENDING	Phi Quan	0983823489	470 tran dai nghia, da nang		2025-11-21 16:01:58.333	2025-11-21 16:01:58.333
54	ORD1763740937127667	3	185000.00	30000.00	pending	momo	PENDING	Phi Quan	0983823489	470 tran dai nghia, da nang		2025-11-21 16:02:17.13	2025-11-21 16:02:17.13
55	ORD1763741507542295	3	185000.00	30000.00	pending	momo	PENDING	Phi Quan	0983823489	470 tran dai nghia, da nang		2025-11-21 16:11:47.545	2025-11-21 16:11:47.545
56	ORD1763741672768895	3	185000.00	30000.00	pending	momo	PENDING	Phi Quan	0983823489	470 tran dai nghia, da nang		2025-11-21 16:14:32.77	2025-11-21 16:14:32.77
58	ORD1763741982326138	1	185000.00	30000.00	pending	momo	COMPLETED	nhithao	0348990415	450 tran dai nghia, ngu hanh son, thanh pho da nang		2025-11-21 16:19:42.329	2025-11-21 16:19:51.782
59	ORD1763742117182256	3	185000.00	30000.00	shipping	momo	COMPLETED	Phi Quan	0983823489	470 tran dai nghia, da nang		2025-11-21 16:21:57.185	2025-11-22 04:59:58.061
57	ORD1763741727352248	1	185000.00	30000.00	cancelled	momo	PENDING	nhithao	0348990415	450 tran dai nghia, ngu hanh son, thanh pho da nang		2025-11-21 16:15:27.354	2025-11-24 10:47:42.256
60	ORD1763981285386234	1	185000.00	30000.00	shipping	momo	COMPLETED	nhithao	0348990415	450 tran dai nghia, ngu hanh son, thanh pho da nang		2025-11-24 10:48:05.389	2025-11-24 10:49:53.525
61	ORD1764038475872894	3	185000.00	30000.00	pending	cod	PENDING	Phi Quan	0983823489	470 tran dai nghia, da nang		2025-11-25 02:41:15.875	2025-11-25 02:41:15.875
62	ORD1764039537893066	3	165000.00	30000.00	pending	cod	PENDING	Phi Quan	0983823489	470 tran dai nghia, da nang		2025-11-25 02:58:57.894	2025-11-25 02:58:57.894
63	ORD1764040543968978	1	165000.00	30000.00	confirmed	cod	PENDING	nhithao	0348990415	450 tran dai nghia, ngu hanh son, thanh pho da nang		2025-11-25 03:15:43.969	2025-11-26 15:50:15.249
64	ORD1764172534499378	1	254000.00	30000.00	pending	cod	PENDING	nhithao	0348990415	450 tran dai nghia, ngu hanh son, thanh pho da nang		2025-11-26 15:55:34.501	2025-11-26 15:55:34.501
\.


--
-- TOC entry 4964 (class 0 OID 17839)
-- Dependencies: 223
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, name, description, price, stock, category_id, seller_id, images, rating, sold_count, is_active, created_at, updated_at) FROM stdin;
4	Áo Phao Lót Lông Cừu Cổ vải Cao Cấp, Áo Khoác Unisex Nam Nữ Đại Hàn Dày Dặn Chống Rét Giữ Ấm- Xưởng Nhung	MÔ TẢ SẢN PHẨM\nÁo Phao Lót Lông Cừu Cao Cấp, Áo Khoác Unisex Nam Nữ Đại Hàn Dày Dặn Chống Rét Giữ Ấm\n\n🔹 THÔNG TIN SẢN PHẨM:\n\n-Chất liệu vỏ ngoài: Vải dù cao cấp, chống nước nhẹ, cản gió hiệu quả\n\n-Lớp lót: Lông cừu nhân tạo dày dặn, mềm mại, giữ nhiệt cực tốt\n\n-Kiểu dáng: Unisex – phù hợp cho cả nam và nữ\n\n-Form áo: Chuẩn Hàn, rộng vừa, thoải mái hoạt động mà vẫn giữ phom dáng\n\n\n\nThiết kế chi tiết:\n\n-Cổ cao che chắn gió rét\n\n-Khóa kéo chắc chắn, trơn tru\n\n-Có túi hai bên tiện lợi\n\n-Bo tay giữ nhiệt – chống gió lùa\n\n-Đường may tỉ mỉ, chắc chắn, không xô lệch\n\n\n\n🎨 MÀU SẮC:\n\n\n\n-Đen cá tính\n\n-Be thời thượng\n\n-Nâu ấm áp\n\n\n\n(Các tone màu basic dễ phối đồ, hợp cả nam lẫn nữ)\n\n\n\n📏 SIZE:\n\nM: 45 – 55kg\n\nL: 55 – 65kg\n\nXL: 65 – 75kg\n\n✨ ƯU ĐIỂM NỔI BẬT:\n\n\n\n✅ Lót lông cừu siêu ấm – mặc trong thời tiết lạnh sâu\n\n✅ Phù hợp đi học, đi làm, du lịch, dạo phố, phượt mùa đông\n\n✅ Áo dày nhưng không nặng, mặc thoải mái cả ngày\n\n✅ Phong cách Hàn Quốc trẻ trung, dễ phối nhiều outfit\n\n✅ Sản phẩm giống ảnh 100%, cam kết chất lượng\n\n\n\n🎁 CHÍNH SÁCH SHOP:\n\n\n\nGiao hàng toàn quốc – đóng gói kỹ – giao nhanh\n\n\nHỗ trợ đổi size nếu không vừa (trong vòng 3 ngày nhận hàng)\n\n\n\nCam kết hàng y hình – kiểm tra kỹ trước khi giao	169000.00	500	9	4	{https://res.cloudinary.com/dnui1a2v5/image/upload/v1764171301/ecomira/products/xi4cougzmwecvba9letd.jpg,https://res.cloudinary.com/dnui1a2v5/image/upload/v1764171303/ecomira/products/tas5tv6j14dpak7l06w4.jpg,https://res.cloudinary.com/dnui1a2v5/image/upload/v1764171302/ecomira/products/czxz8ebjic5igsyq9ci7.jpg,https://res.cloudinary.com/dnui1a2v5/image/upload/v1764171303/ecomira/products/srlpkl0heb8wrg8gyv5p.jpg}	0.00	0	t	2025-11-26 15:35:48.998	2025-11-26 15:35:48.998
1	iPhone 16 128GB | Chính hãng VN/A	Thông số kỹ thuật\nKích thước màn hình\t\n6.1 inches\n\nCông nghệ màn hình\t\nSuper Retina XDR OLED\n\nCamera sau\t\nCamera chính: 48MP, f/1.6, 26mm, Focus Pixels 100%, hỗ trợ ảnh có độ phân giải siêu cao\nCamera góc siêu rộng: 12MP, ƒ/2.2, 13 mm, Focus Pixels 100%, Độ phóng đại quang học 2x, độ thu nhỏ quang học 2x; phạm vi thu phóng quang học 4x Độ thu phóng kỹ thu\n\nCamera trước\t\n12MP, ƒ/1.9, Tự động lấy nét theo pha Focus Pixels\n\nChipset\t\nApple A18\n\nCông nghệ NFC\t\nCó\n\nDung lượng RAM\t\n8 GB\n\nBộ nhớ trong\t\n128 GB\n\nThẻ SIM\t\nSim kép (nano-Sim và e-Sim) - Hỗ trợ 2 e-Sim\n\nHệ điều hành\t\niOS 18\n\nĐộ phân giải màn hình\t\n2556 x 1179 pixels\n\nTính năng màn hình\t\nDynamic Island\nMàn hình HDR\nTrue Tone\nDải màu rộng (P3)\nHaptic Touch\nTỷ lệ tương phản 2.000.000:1\nĐộ sáng tối đa 1000 nit\n460 ppi\nLớp phủ kháng dầu chống in dấu vân tay\nHỗ trợ hiển thị đồng thời nhiều ngôn ngữ và ký tự\n\nLoại CPU\t\nCPU 6 lõi mới với 2 lõi hiệu năng và 4 lõi tiết kiệm điện	20990000.00	248	1	2	{https://res.cloudinary.com/dnui1a2v5/image/upload/v1763195342/ecomira/products/fxppep8s71untkc3ay5t.jpg,https://res.cloudinary.com/dnui1a2v5/image/upload/v1763195339/ecomira/products/tqoqilofkwar7jxnorqb.jpg,https://res.cloudinary.com/dnui1a2v5/image/upload/v1763195339/ecomira/products/zmkmru7diygkk1z0gtqq.jpg,https://res.cloudinary.com/dnui1a2v5/image/upload/v1763195338/ecomira/products/dd1aho9cgcnpbziohn5p.jpg,https://res.cloudinary.com/dnui1a2v5/image/upload/v1763195338/ecomira/products/nexkrkqicudbjisni9zf.jpg}	0.00	2	t	2025-11-15 08:29:51.72	2025-11-20 09:11:32.256
5	Giày thể thao Sneaker Unisex Leonerva 808 bản Da Microfiber - 7 Màu Bestseller	MÔ TẢ SẢN PHẨM\n✅ Hàng Chính Hãng Việt Nam 100% 🇻🇳 Brand LEOnerva sản xuất ❗️\n\n❌ Bản Nâng Cấp nên đi ĐÚNG SIZE - bản Thường nên đi Tăng lên 1 Size\n\n\n\nMàu : VS2 Đế Nâu, VS1 Đế Nâu, VS1 Trắng Full, VS1 Be Đế Đen, VS1 Trắng Vạch Đen, VS1 Đen Full, VS2 Trắng Đen\n\n\n\nFullsize : 36 - 45\n\n\n\nKiểu dáng: trẻ trung, năng động, thiết kế basic. Phù hợp với các hoạt động thường ngày như đi chơi, đi làm, đi học, đi café với hội bạn thân cuối tuần. Chất liệu: Da microfiber đặc tính mềm mại, tinh tế, kháng nước tốt hơn da thật\n\n\n\nLót giày: Êm, mềm mại, thoáng khí, không gây nóng chân\n\n\n\nChiều cao đế: 3 cm\n\n\n\nMàu sắc trên ảnh có thể khác 3-4% so với ngoài đời thực vì các yếu tố khách quan như màn hình và ánh sáng. Rất mong các bạn thông cảm.\n\n\n\nVề Leonerva\n\nLEONERVA kỳ vọng tạo ra những sản phẩm giày thời trang ấn tượng được sản xuất tại Việt Nam, những đôi giày chất lượng đạt 70% đến 90% so với hãng quốc tế nhưng giá thành chỉ bằng ½ đến 1/5\n\n\n\nChính Sách Bảo Hành\n\n\n\nBảo hành da trong 3 tháng\n\n\n\nBảo hành keo đế trong 12 tháng\n\n\n\nChính Sách Đổi Trả:\n\n\n\nĐổi trả trong 38 ngày với bất kỳ lý do gì\n\n\n\nLàm mới giày 5 lần trong 6 tháng sử dụng\n\nHƯỚNG DẪN BẢO QUẢN VÀ SỬ DỤNG\n\n👉 Không dùng hóa chất hay bột giặt có hoạt tính tẩy rửa mạnh \n\n👉 Không dùng bàn chải cứng để vệ sinh giày \n\n👉 Không đi mưa ngâm nước lâu, không phơi giày trực tiếp dưới ngoài trời nắng gắt\n\n👉 Tránh cất giữ giày khi còn ẩm ướt	450000.00	600	10	4	{https://res.cloudinary.com/dnui1a2v5/image/upload/v1764171526/ecomira/products/xb79nzwttoe9i6ymh7dv.jpg,https://res.cloudinary.com/dnui1a2v5/image/upload/v1764171525/ecomira/products/dkflmxdvdpnl1akroqu2.jpg,https://res.cloudinary.com/dnui1a2v5/image/upload/v1764171526/ecomira/products/s68bvhafgy5rpkvih4by.jpg,https://res.cloudinary.com/dnui1a2v5/image/upload/v1764171526/ecomira/products/zpzttjzodrvloilatnfd.jpg}	0.00	0	t	2025-11-26 15:39:20.837	2025-11-26 15:39:20.837
6	[FULL BOX-Chân To Tăng Size] Giày thể thao nữ đế siêu nhẹ, chất da sịn WY	MÔ TẢ SẢN PHẨM\n[KHO GIÀY LUCKY SHOES - H102] Sneaker Nam Cổ Thấp EGM Phong Cách Cực Ngầu, Giày Nam Quảng Châu Chất Lượng Cao\n\n≧◔◡◔≦ KHÔNG CẦN TÌM KIẾM THÊM, ĐƠN GIẢN VÌ GIÀY TẠI KHO CHÚNG TÔI BÁN LÀ RẺ NHẤT ≧◔◡◔≦\n\n✔️ Kho Giày LUCKY SHOES VIỆT NAM ♥ GIÀY TẠI KHO KHÔNG LO VỀ GIÁ ♥\n\n✔️ Mã Hàng : H102\n\n💥 Chi tiết sản phẩm Giày Sneaker Nam\n\n✔️Xuất xứ : Giày Quảng Châu, Hàng Cao Cấp\n\n✔️Chất liệu : Đế Cao Su Non, Da PU cao cấp mềm mại, kết hợp vải sợi thoáng khí bền đẹp theo thời gian\n\n✔️Thông số kích thước : 39 40 41 42 43 44\n\n✔️Màu sắc : Đen, Xanh Lam, Xám\n\n💥 CÁCH CHỌN SIZE Giày Sneaker Nam:\n\nChiều dài bàn chân (đo từ gót chân đến ngón cái) và Chiều rộng bàn chân PHẢI NHỎ HƠN KICH THƯỚC TƯƠNG ỨNG DƯỚI ĐÂY:\n\n★ Size 39 chiều dài bên trong Giày 24.5cm, Chiều rộng bên trong Giày 9.5cm\n\n★ Size 40 chiều dài bên trong Giày 25cm, Chiều rộng bên trong Giày 9.5cm -10cm\n\n★ Size 41 chiều dài bên trong Giày 25.5cm, Chiều rộng bên trong Giày 10cm\n\n★ Size 42 chiều dài bên trong Giày 26cm, Chiều rộng bên trong Giày 10cm - 10.5cm\n\n★ Size 43 chiều dài bên trong Giày 26.5cm, Chiều rộng bên trong Giày 10.5cm\n\n★ Size 44 chiều dài bên trong Giày 27cm, Chiều rộng bên trong Giày 10.5cm -11cm\n\n💥 Giày Nam - GIÀY THỂ THAO NAM : ĐẶC ĐIỂM SẢN PHẨM :\n\n✔️ Giày dễ phối đồ thích hợp cho các hoạt động đi lại hàng ngày, chạy bộ\n\n✔️ Đế xẻ rãnh tạo cảm giác thoải mái khi đi, Đế giày được thiết kế chống trượt , Giày tăng chiều cao với cao su tổng hợp chống mài mòn, nhẹ thoáng khí.\n\n✔️ Thích hợp với các mùa trong năm: Xuân - Hè - Thu - Đông\n\n✔️ Thiết kế Giày ôm chân, gọn dáng, Phối đồ cực dễ.\n\n💥 HƯỚNG DẪN BẢO QUẢN GIÀY THỂ THAO NAM\n\n✔️ Để giày ở nơi khô ráo thoáng mát để giữ giày được bền đẹp hơn\n\n✔️ Vệ sinh giày, dùng khăn hay bàn trải lông mềm để chải sạch giày cùng với nước tẩy rửa giày chuyên dụng với da hay da Pu\n\n✔️ Có thể giặt giày cùng với chất tẩy rửa nhẹ\n\n❌ KHUYẾN CÁO\n\n⛔ Không dùng hóa chất hay bột giặt có hoạt tính tẩy rửa mạnh\n\n⛔ Không dùng bàn chải cứng để vệ sinh giày sẽ làm hư\n\n⛔ Không đi mưa ngâm nước lâu, không phơi giày trực tiếp dưới ngoài trời nắng gắt\n\n💥 Lưu ý vận chuyển\n\n☛ Giao hàng nhanh trong 2h khi chọn Hỏa Tốc\n\n💥 SHOP CAM KẾT:\n\n✔️ Cam kết chất lượng, bảo hành do lỗi sản xuất : 06 Tháng\n\n✔️ Hoàn tiền nếu sản phẩm không giống với mô tả ( Video Hình Ảnh được quay chụp trực tiếp từ điện thoại, không qua chỉnh sửa)\n\n✔️ Hỗ trợ đổi size khi không vừa\n\n✔️ Nhận hàng TRƯỚC - Thu tiền SAU , Được Kiểm tra Hàng trước khi lấy.\n\n✔️ Giày Bán Trực Tiếp Tại Kho, Giá Cam Kết Rẻ Nhất Thị Trường.	125000.00	500	10	5	{https://res.cloudinary.com/dnui1a2v5/image/upload/v1764171903/ecomira/products/u56flel5l3vjewqhnzcw.jpg,https://res.cloudinary.com/dnui1a2v5/image/upload/v1764171831/ecomira/products/ciamaayv7rwjjfki5jey.jpg,https://res.cloudinary.com/dnui1a2v5/image/upload/v1764171830/ecomira/products/njeyv8pudfhutvao602o.jpg,https://res.cloudinary.com/dnui1a2v5/image/upload/v1764171831/ecomira/products/zdhtqsemud5o4qdocaxd.jpg,https://res.cloudinary.com/dnui1a2v5/image/upload/v1764171831/ecomira/products/tubtn2mpfpcnedu9beqt.jpg}	0.00	0	t	2025-11-26 15:45:06.751	2025-11-26 15:45:06.751
2	Nước Tẩy Trang làm sạch sâu dịu nhẹ cho mọi loại da - Garnier Micellar Cleansing Water 400ml	MÔ TẢ SẢN PHẨM\nNước làm sạch và tẩy trang dành cho mọi loại da Garnier Micellar Water 400ml , bạn có thể chọn phân loại phù hợp với da bạn\nI'm\n+ Màu hồng : dành cho da nhạy cảm\n\n+ Màu xanh dương : dành cho da dầu và mụn (Sạch da giảm nhờn)\n\n+ Màu vàng : giúp làm sáng da , hỗ trợ loại bỏ nám\n\n+ Màu trắng : dành cho mọi loại da, đặc biệt da khô và da trang điểm. \n• ƯU ĐIỂM NỔI BẬT\n\nSử dụng công nghệ Micelles (Micellar Technology), phân tử Micelles lấy đi bụi bẩn sâu bên trong lỗ chân lông theo cơ chế hoạt động của nam châm.\n\n• HIỆU QUẢ SỬ DỤNG\n\n- [MỚI] Màu xanh lá: Hiệu quả được kiểm chứng bởi chuyên gia:\n\n+20% lỗ chân lông được cải thiện*\n\n+32% độ mịn màng của da*\n\n(*Hiệu quả được đánh giá trên 85 phụ nữ, sử dụng 2 lần/ngày, sau 56 ngày, khuyến khích dùng kèm sản phẩm có SFP30).\n\n- Màu xanh dương: Làn da sạch thoáng, không còn dầu thừa và giảm bớt nguy cơ gây mụn\n\n- Màu hồng: làm sạch và chăm sóc da dịu nhẹ, đặc biệt phù hợp với da nhạy cảm\n\n- Màu trắng: Làn da được làm sạch sâu hoàn hảo kể cả lớp trang điểm lâu trôi. Da được dưỡng ẩm dịu nhẹ với dầu argan.\n\n- Màu vàng: Ngay lập tức, làn da sạch thoáng hoàn hảo, mềm mại và sáng rạng rỡ. Sử dụng thường xuyên giúp lấy đi lớp da chết gây ra da bị xỉn màu.\n• HƯỚNG DẪN SỬ DỤNG:\n\n- Lắc đều, thấm một lượng vừa đủ ra bông tẩy trang\n\n- Lau nhẹ trên da mặt, vùng da quanh mắt và môi theo hướng xoay tròn (không chà xát da), không cần rửa lại với nước.\n\n- Nên dùng hằng ngày ngay cả khi không trang điểm.\n\n- Liều lượng: 1 lần sử dụng = 2ml	159000.00	937	6	2	{https://res.cloudinary.com/dnui1a2v5/image/upload/v1763474528/ecomira/products/xrfl5gh4tyl8ozhohbso.jpg,https://res.cloudinary.com/dnui1a2v5/image/upload/v1763474527/ecomira/products/y5itckvcky85xwrtrjio.jpg,https://res.cloudinary.com/dnui1a2v5/image/upload/v1763474528/ecomira/products/hjdrc1tts4uwyfzkzhoz.jpg,https://res.cloudinary.com/dnui1a2v5/image/upload/v1763474527/ecomira/products/bdb8rzr5zqmg1qadnd5a.jpg,https://res.cloudinary.com/dnui1a2v5/image/upload/v1763474527/ecomira/products/eyvdq4c7g1wdi6v65xre.jpg}	0.00	63	t	2025-11-18 14:07:40.106	2025-11-26 15:55:34.515
3	Áo Thun Nữ Ôm Body JUSTDUN B18 Cổ Tròn Tay Ngắn, Cotton Lông Mịn Co Giãn 4 Chiều, Mềm Mại Thoáng Khí	MÔ TẢ SẢN PHẨM\n1. Thông tin cơ bản về sản phẩm\n\nÁo Thun Nữ Ôm Body JUSTDUN B18 Cổ Tròn Tay Ngắn, Cotton Lông Mịn Co Giãn 4 Chiều, Mềm Mại Thoáng Khí.\n\nChất liệu: Thun cotton cao cấp, mềm mịn, thoáng khí, hạn chế xù lông.\n\nThiết kế: Dáng ôm body, cổ tròn, tay ngắn, giúp tôn đường cong tự nhiên.\n\nMàu sắc: Đen, Trắng, Đỏ Đô, Đỏ Mận, Hồng, Hồng Phấn, Tím Pastel, Xám, Nâu, Nâu Đậm, Ghi Tay, Xám Trắng Tiêu, Chì, Xanh Thanh, Be, Kem, Xanh Ngọc, Tiêu Đậm, Xanh Cổ Vịt, Rêu Lạnh.\n\n\n\nXuất xứ: Việt Nam.\n\n\n\nBảng size:\n\n\n\nS: <46kg, <1m63, V1 <80cm\n\n\n\nM: <49kg, <1m66, V1 <83cm\n\n\n\nL: <52kg, <1m70, V1 <86cm\n\n\n\nXL: <56kg, <1m72, V1 <89cm\n\n\n\nXXL: <60kg, <1m72, V1 <94cm\n\n(Bảng size chỉ mang tính tham khảo, nên liên hệ shop để được tư vấn kỹ hơn.)\n\n2. Công dụng & đặc điểm sản phẩm\n\n\n\nDáng ôm nhẹ giúp tôn dáng, dễ phối với nhiều phong cách khác nhau.\n\n\n\nChất vải cotton mềm mịn, co giãn 4 chiều, thoáng mát cả ngày dài.\n\n\n\nThích hợp mặc đi làm, đi học, dạo phố hoặc du lịch.\n\n3. Hướng dẫn sử dụng & bảo quản\n\n\n\nƯu tiên giặt tay để áo giữ form và độ bền tốt hơn.\n\n\n\nNếu giặt máy, nên chọn chế độ nhẹ, nhiệt độ dưới 40°C.\n\n\n\nKhông sử dụng thuốc tẩy mạnh.\n\n\n\nPhơi nơi thoáng mát, tránh ánh nắng trực tiếp.\n\n\n\nỦi mặt trái ở nhiệt độ vừa phải khi áo còn hơi ẩm.\n\n4. Chính sách đổi trả & hỗ trợ\n\n\n\nHỗ trợ đổi trả trong 14 ngày kể từ khi nhận hàng.\n\n\n\nĐiều kiện: Sản phẩm còn tem, tag, chưa qua sử dụng, kèm video mở hộp.\n\n\n\nHỗ trợ đổi size hoặc màu nếu kho còn hàng.	65000.00	999	9	4	{https://res.cloudinary.com/dnui1a2v5/image/upload/v1764171071/ecomira/products/gzoa7zsdlpft1kd0qssi.jpg,https://res.cloudinary.com/dnui1a2v5/image/upload/v1764171071/ecomira/products/lmvsskkcn2ueo090kwiy.jpg,https://res.cloudinary.com/dnui1a2v5/image/upload/v1764171132/ecomira/products/ei4dmoeuwv5vgdjrfxj4.jpg}	0.00	1	t	2025-11-26 15:32:16.731	2025-11-26 15:55:34.515
\.


--
-- TOC entry 4962 (class 0 OID 17829)
-- Dependencies: 221
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sessions (id, user_id, token, expires_at, created_at) FROM stdin;
1	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjMxOTQ2NzgsImV4cCI6MTc2Mzc5OTQ3OH0.fDuk5cW3QoZvINkMN1jnaXKgV_JJrMzaavO-ApRGQE0	2025-11-22 08:17:58.509	2025-11-15 08:17:58.514
2	2	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoic2NoYW5uZWxAZ21haWwuY29tIiwidXNlclR5cGUiOiJzZWxsZXIiLCJpYXQiOjE3NjMxOTQ4NDEsImV4cCI6MTc2Mzc5OTY0MX0.Bp6N5jYupVlHO1GD7w_1F9-ivWOrk_AXO8Hhrz9viN4	2025-11-22 08:20:41.061	2025-11-15 08:20:41.063
3	2	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoic2NoYW5uZWxAZ21haWwuY29tIiwidXNlclR5cGUiOiJzZWxsZXIiLCJpYXQiOjE3NjMxOTUzMjMsImV4cCI6MTc2MzgwMDEyM30.vYPM9WvtIkkqb44xM-mGJ3E6dKMEgZm3XmCCqi1bqko	2025-11-22 08:28:43.762	2025-11-15 08:28:43.766
4	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjMxOTU0ODEsImV4cCI6MTc2MzgwMDI4MX0.EEoIt2OsneIQ3tfSEUvlUztH4kW0ehWEl3kdXs_GUis	2025-11-22 08:31:21.822	2025-11-15 08:31:21.824
5	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjMyMjA4ODMsImV4cCI6MTc2MzgyNTY4M30.bD4Edl7WBexA_-HCVxDwf4dbPLs1npKLJisdCePfdAg	2025-11-22 15:34:43.108	2025-11-15 15:34:43.114
6	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjMyMjE1NTAsImV4cCI6MTc2MzgyNjM1MH0.0aCCijqUH425GjIa2u_6wP8ZmXSUyc2iin5nJqFtbR4	2025-11-22 15:45:50.785	2025-11-15 15:45:50.79
7	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjMyMjE5MjYsImV4cCI6MTc2MzgyNjcyNn0._hZjdjB1i4fDtiIZ0utcYH1-eawg7th-rFNfNXXoPOA	2025-11-22 15:52:06.386	2025-11-15 15:52:06.391
8	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjMyMjI2MTAsImV4cCI6MTc2MzgyNzQxMH0.z0tQjhfBlM0l32vPBSf9a_IzacZj3tR4S_6nmkLHuq8	2025-11-22 16:03:30.291	2025-11-15 16:03:30.297
9	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjMyNjc2MDAsImV4cCI6MTc2Mzg3MjQwMH0.gMqTCOrDTE4Ljj0__QvSP2C2vADM9s_L2fMWNdY39T4	2025-11-23 04:33:20.308	2025-11-16 04:33:20.313
10	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjMyNjg5NjAsImV4cCI6MTc2Mzg3Mzc2MH0.1XFAOqmSvMs8TU2BefJlPDraw7PCnRf7hbxkQyh_9fs	2025-11-23 04:56:00.71	2025-11-16 04:56:00.717
11	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjMyNjk0NTgsImV4cCI6MTc2Mzg3NDI1OH0.bFy6KG4k07pB0qg4kjA3ur4ggLZ8BfpsWsSHN0BF30M	2025-11-23 05:04:18.491	2025-11-16 05:04:18.493
12	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjMyNzAxMjgsImV4cCI6MTc2Mzg3NDkyOH0.kfbFVMiRhMQEACODrABkkmBHkU2xkemiNDSM4qz-ATo	2025-11-23 05:15:28.133	2025-11-16 05:15:28.135
13	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjMyNzAzMDUsImV4cCI6MTc2Mzg3NTEwNX0.G6_cA9mhZyMSJU-5f4VSKUAwHcQ8epUAUbpBho5falk	2025-11-23 05:18:25.557	2025-11-16 05:18:25.558
14	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjMyNzA0MjQsImV4cCI6MTc2Mzg3NTIyNH0.sgB_fcPlp5jfvG0ZFZqW1YKMw2DIsEhmn-SnggpIMt8	2025-11-23 05:20:24.756	2025-11-16 05:20:24.762
15	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjMyNzA3ODEsImV4cCI6MTc2Mzg3NTU4MX0.Y8mR6cA5P8kfIj8XwU9M2Bp47lYvrNIudK1mcpAWvdc	2025-11-23 05:26:21.949	2025-11-16 05:26:21.952
16	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjMyNzA4NjgsImV4cCI6MTc2Mzg3NTY2OH0.rSdxN9tW2DkaBCTzPiuaLQWBrKETHTP0p3D77VuK1VQ	2025-11-23 05:27:48.238	2025-11-16 05:27:48.24
17	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjMyNzA5NjQsImV4cCI6MTc2Mzg3NTc2NH0.GfecA5aaLKvB_KbSHjoHnCMHOCLO11xH-HuR8FW0yZA	2025-11-23 05:29:24.57	2025-11-16 05:29:24.572
18	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjMyNzExNzAsImV4cCI6MTc2Mzg3NTk3MH0.wdcehH4ekVUmoASFv2AowWO0w1f08dblzEaOpi6lTR4	2025-11-23 05:32:50.172	2025-11-16 05:32:50.173
19	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzMjcxMzI2LCJleHAiOjE3NjM4NzYxMjZ9.4UltxdgZzlD_QWuFIW-UHw9eSuACSKjBF7MRrZvN4vs	2025-11-23 05:35:26.881	2025-11-16 05:35:26.883
20	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjMyODU1NjcsImV4cCI6MTc2Mzg5MDM2N30.49hDDXbWrQGDBzS3Im6-xhlGcq05_DMt015O69eiLto	2025-11-23 09:32:47.663	2025-11-16 09:32:47.669
21	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjMyODYwNTAsImV4cCI6MTc2Mzg5MDg1MH0.973-yoYEga4Gj0cmNskq9RC6AV8b5y7FeCM6hsH1PKY	2025-11-23 09:40:50.597	2025-11-16 09:40:50.599
22	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjMyODYxMjksImV4cCI6MTc2Mzg5MDkyOX0.EHInSwLCH6V511_2evTwAwQqtMWgqpFJLGepRROZc38	2025-11-23 09:42:09.716	2025-11-16 09:42:09.718
23	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjMyODYzNzUsImV4cCI6MTc2Mzg5MTE3NX0.pydnMtRgSTz9eBuBpvg9pK-nW9Cfz1pPwV53-4CsWcs	2025-11-23 09:46:15.138	2025-11-16 09:46:15.14
24	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjMyOTk3OTcsImV4cCI6MTc2MzkwNDU5N30.6aOwNkwT_TcaHx2F30zFuiXYOcu-pGARj5Kt4CJINmg	2025-11-23 13:29:57.927	2025-11-16 13:29:57.933
25	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjMzMDAzNTQsImV4cCI6MTc2MzkwNTE1NH0.k7KV377FhizdMuamqsHHA6k-nWRGBPHxW_tvGfwp8Aw	2025-11-23 13:39:14.936	2025-11-16 13:39:14.939
26	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjMzMDA3MTIsImV4cCI6MTc2MzkwNTUxMn0.SH0vQvZnqbmCLYTVxmYAPPAPskPJuX0FNdyNZxKPv6w	2025-11-23 13:45:12.79	2025-11-16 13:45:12.791
27	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjM0NjYxMDUsImV4cCI6MTc2NDA3MDkwNX0.aDg7UAL9Ce1IYLCwHltd9qFLGan0jb7yqwZpRiaDGS8	2025-11-25 11:41:45.288	2025-11-18 11:41:45.296
28	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjM0NjYxOTEsImV4cCI6MTc2NDA3MDk5MX0.mu7spEQxj2OOc-TGtubab0f1pdGs9XU1e9xvv5AiS7o	2025-11-25 11:43:11.298	2025-11-18 11:43:11.3
29	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzNDY2MjU0LCJleHAiOjE3NjQwNzEwNTR9.M5iL76gSMcejyLOJod8CQF7HSCOJTpkRg6abeTUXprM	2025-11-25 11:44:14.655	2025-11-18 11:44:14.658
30	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjM0NjYzMzEsImV4cCI6MTc2NDA3MTEzMX0.FgLcaYdFSDTTvmVuSEv3V2rtznA_J0SFMuv-s1DaFPE	2025-11-25 11:45:31.186	2025-11-18 11:45:31.189
31	2	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoic2NoYW5uZWxAZ21haWwuY29tIiwidXNlclR5cGUiOiJzZWxsZXIiLCJpYXQiOjE3NjM0Njc2NjEsImV4cCI6MTc2NDA3MjQ2MX0.QBUfbqwlI7F_0o9fxg2corc30xweL6GzqQ41Gxjn3V4	2025-11-25 12:07:41.47	2025-11-18 12:07:41.472
32	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjM0Njc2OTMsImV4cCI6MTc2NDA3MjQ5M30.uiydxak6K2rUgE_QOLI01SUAI8W469VlwDoaHRd76ck	2025-11-25 12:08:13.672	2025-11-18 12:08:13.674
33	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjM0NjgyMzAsImV4cCI6MTc2NDA3MzAzMH0.sfRaWHZCm2e67pGc-19Jtkv-EZY5y_i6OBDE8t9K-TE	2025-11-25 12:17:10.532	2025-11-18 12:17:10.534
34	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjM0Njk0MTUsImV4cCI6MTc2NDA3NDIxNX0.-aKqbTlY3r34UJtyfCXEdPq8gLpIlkKVDMRJYknBCa8	2025-11-25 12:36:55.187	2025-11-18 12:36:55.188
35	2	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoic2NoYW5uZWxAZ21haWwuY29tIiwidXNlclR5cGUiOiJzZWxsZXIiLCJpYXQiOjE3NjM0Njk3MDYsImV4cCI6MTc2NDA3NDUwNn0.nSFw2tu2cqXpeeepH53ze5YJxPwxjqMPTRacK8XtfeU	2025-11-25 12:41:46.901	2025-11-18 12:41:46.903
36	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjM0Njk4MjMsImV4cCI6MTc2NDA3NDYyM30.Vf42gSOyz5efkI-PqM3YROJc2Em_o_VjZ-Ok_I-6nyY	2025-11-25 12:43:43.388	2025-11-18 12:43:43.39
37	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjM0NzAxMDQsImV4cCI6MTc2NDA3NDkwNH0.d-WLClHsTEttCDYc4COIBQW1VYgpIdrj40qsKTfn3nA	2025-11-25 12:48:24.477	2025-11-18 12:48:24.479
38	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjM0NzA1NzUsImV4cCI6MTc2NDA3NTM3NX0.bvV9ylFtYvBP3dHn7Ls3dWkwlo5-JPEks_p3Vcfebhg	2025-11-25 12:56:15.72	2025-11-18 12:56:15.723
39	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjM0NzA5MDQsImV4cCI6MTc2NDA3NTcwNH0.uAY--OP-njVhzsz2VV7OEA_KnPEP0T3o2SmNpu2c-vU	2025-11-25 13:01:44.925	2025-11-18 13:01:44.928
40	2	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoic2NoYW5uZWxAZ21haWwuY29tIiwidXNlclR5cGUiOiJzZWxsZXIiLCJpYXQiOjE3NjM0NzQ0OTUsImV4cCI6MTc2NDA3OTI5NX0.SKHMdvfWb6kxRQfeNhH_4lvRYQ9P9YUl5WoB3IZUGEg	2025-11-25 14:01:35.336	2025-11-18 14:01:35.342
41	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjM0NzQ4OTEsImV4cCI6MTc2NDA3OTY5MX0.1HFf70eYdc7znhXkCitdVqQjP83uuGapESTJFMIZaNc	2025-11-25 14:08:11.543	2025-11-18 14:08:11.546
42	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjM0NzU5NTIsImV4cCI6MTc2NDA4MDc1Mn0.JH335LGZDYM3lloThlQwkn-I6Mi8eisK3v38j89psTg	2025-11-25 14:25:52.215	2025-11-18 14:25:52.22
43	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjM0NzYzNjAsImV4cCI6MTc2NDA4MTE2MH0.zY-XvlTbeqZc5iC0J9IG0Wovg_ixDf2HSPsGt0aDUrk	2025-11-25 14:32:40.872	2025-11-18 14:32:40.874
44	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjM0NzgwNjksImV4cCI6MTc2NDA4Mjg2OX0.MPElXxWSQaObP0FxYvlRqS9c_iI5mER_bfRXuWEdAHg	2025-11-25 15:01:09.875	2025-11-18 15:01:09.878
45	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjM0Nzg0MTgsImV4cCI6MTc2NDA4MzIxOH0.e_ovA7T9UDgUQRSm_SHP8iiK2nBwbRIzQgLjT7OgxnU	2025-11-25 15:06:58.967	2025-11-18 15:06:58.969
46	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjM0Nzg3MDksImV4cCI6MTc2NDA4MzUwOX0.vn2WulKF-F7iRxnmTwgOuW6DePiikKNnghTki_CaBJ8	2025-11-25 15:11:49.215	2025-11-18 15:11:49.217
47	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjM0Nzk5NjMsImV4cCI6MTc2NDA4NDc2M30.mysdg5EbxUdVrVL_glvRlsfCc9R5f5BkW9EKQQkr3H0	2025-11-25 15:32:43.158	2025-11-18 15:32:43.16
48	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjM0ODA1NjMsImV4cCI6MTc2NDA4NTM2M30.occPrqEIr25oAMxKyoh53HQ4EXHMeFCc2m5A_AOuvlg	2025-11-25 15:42:43.811	2025-11-18 15:42:43.813
49	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjM0ODIwNjcsImV4cCI6MTc2NDA4Njg2N30.c8h_1-iXSTwrwdun9V3dLkUEi9gP7ppCpVIBkAwwLX0	2025-11-25 16:07:47.179	2025-11-18 16:07:47.181
50	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjM1MTcwMDMsImV4cCI6MTc2NDEyMTgwM30.WL0UGZ6ZxFvCP9TJpDNjnWMMn4OX5F2oCx1Gq2q6mOo	2025-11-26 01:50:03.787	2025-11-19 01:50:03.791
51	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzNTE4MTIzLCJleHAiOjE3NjQxMjI5MjN9.rmPFDnArEiSgz7jVyhgXlGVZJvxq8Ac5BF8kySD4suw	2025-11-26 02:08:43.502	2025-11-19 02:08:43.504
52	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzNTE4Mjg0LCJleHAiOjE3NjQxMjMwODR9.pV77bz_YG16gV9CDuiiesv30Nn5MPA5pgCriWyr4ncM	2025-11-26 02:11:24.62	2025-11-19 02:11:24.624
53	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzNTE4MzEyLCJleHAiOjE3NjQxMjMxMTJ9.Fz8xYH0R-fD6AhfYagPhskV_9-SLHg-l3gE5vvcMeP4	2025-11-26 02:11:52.171	2025-11-19 02:11:52.172
54	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzNTE4Mzk4LCJleHAiOjE3NjQxMjMxOTh9.xvkqwHOQCAYXbJ9DuLoijuOtTTyMPB4nTtZM8dibOkA	2025-11-26 02:13:18.667	2025-11-19 02:13:18.668
55	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzNTE4NDc3LCJleHAiOjE3NjQxMjMyNzd9.3K1s4UGmVkH35zTcoDug2wBR1PA6oimRbsVsZOKrOPo	2025-11-26 02:14:37.437	2025-11-19 02:14:37.438
56	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzNTIwMjgyLCJleHAiOjE3NjQxMjUwODJ9.g81ChuhEo9oHrbDcGHBqNBjVYz5UCQSOcxw4O3BVFZg	2025-11-26 02:44:42.997	2025-11-19 02:44:43.001
57	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjM1MjIyNTMsImV4cCI6MTc2NDEyNzA1M30.sB7jBLSF3A3T8vRx77jjiZFxewfwSJjbUlO-ep91-Us	2025-11-26 03:17:33.769	2025-11-19 03:17:33.772
58	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjM1MjI2NjMsImV4cCI6MTc2NDEyNzQ2M30.tSrvnCRVcta59pr5awjsLGobLXzx81EdW99ER7uA4tw	2025-11-26 03:24:23.397	2025-11-19 03:24:23.399
59	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjM1MjI5MjcsImV4cCI6MTc2NDEyNzcyN30.IoEhccD4gpzsfirEDoRZX0VyB96zgRGYCEWFKGdIGkc	2025-11-26 03:28:47.728	2025-11-19 03:28:47.731
60	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjM1MjMxOTMsImV4cCI6MTc2NDEyNzk5M30.p_Jo-WkL4V6iwMTR7V_cJ4VZcvd2muM8aZ-B1MXIIfw	2025-11-26 03:33:13.002	2025-11-19 03:33:13.003
61	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjM1MjMyOTIsImV4cCI6MTc2NDEyODA5Mn0.lZi_yT-b0PF8OxRoHr5Oql-csahCx8Ov5gA7j28zBhc	2025-11-26 03:34:52.084	2025-11-19 03:34:52.085
62	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjM1MjM3NTUsImV4cCI6MTc2NDEyODU1NX0.nHADya4pn6ycYUCEZedsP788DEWTH-weQWaP2mGcHrc	2025-11-26 03:42:35.904	2025-11-19 03:42:35.906
63	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjM1MjQ0OTUsImV4cCI6MTc2NDEyOTI5NX0.i-LY_Wz1bdkwX4NZgwDGRX5dNA8tUKoY0zS9iAyUrZ8	2025-11-26 03:54:55.919	2025-11-19 03:54:55.92
64	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzNTI0NzM1LCJleHAiOjE3NjQxMjk1MzV9.U1EEoKH4iQ8ikJakXIlsWnp13KG9OhjRHebUx0i6-sY	2025-11-26 03:58:55.819	2025-11-19 03:58:55.82
65	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzNTI0ODUxLCJleHAiOjE3NjQxMjk2NTF9.M_I3I3OPB-DREKkUcXk9LO3B0vF43T2RXIeF0cBIbvE	2025-11-26 04:00:51.507	2025-11-19 04:00:51.517
66	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjM2MDgyOTcsImV4cCI6MTc2NDIxMzA5N30.TXknSXgI81Rnnd63yGkFzES2Xf-TzzbLuuJWR48Us5c	2025-11-27 03:11:37.221	2025-11-20 03:11:37.227
67	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjM2MjY2NDEsImV4cCI6MTc2NDIzMTQ0MX0.FPVMFViSmuWZ85pr7lL87s8T4DS2kGUuoY053coP-Lo	2025-11-27 08:17:21.115	2025-11-20 08:17:21.121
68	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjM2MjgwOTcsImV4cCI6MTc2NDIzMjg5N30.TiD03g-z6HZVeqjFP_V3MWRCggaNdFnJqGqPQX9MYP8	2025-11-27 08:41:37.1	2025-11-20 08:41:37.103
69	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjM2Mjk4MzEsImV4cCI6MTc2NDIzNDYzMX0.IyrPOCRDlLxoI8-qb1UsiwArsjmLaK_aSFCAU03BEIM	2025-11-27 09:10:31.045	2025-11-20 09:10:31.051
70	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjM2MzM0OTUsImV4cCI6MTc2NDIzODI5NX0.5pdo6gvfyXobmYoDsJ950Oi0merHIUfu2QRzOfvWE8s	2025-11-27 10:11:35.122	2025-11-20 10:11:35.124
71	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzNjMzNTk0LCJleHAiOjE3NjQyMzgzOTR9.zppTEiXAhsgQZCAy2IGrDHyCNBCRzj0QE54A2-GyWTs	2025-11-27 10:13:14.705	2025-11-20 10:13:14.706
72	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjM2NDg2MjcsImV4cCI6MTc2NDI1MzQyN30.Uoy3ZRkdIV-r4Y1b1cs9ArmbCawJJoPuXn6e44yotoY	2025-11-27 14:23:47.042	2025-11-20 14:23:47.048
73	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzNjQ4Njc4LCJleHAiOjE3NjQyNTM0Nzh9.oRoeAG-zPpKwfbk7SRjxEtqGJmN_JKBsoguaKhjglaY	2025-11-27 14:24:38.194	2025-11-20 14:24:38.197
74	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzNjQ4OTQyLCJleHAiOjE3NjQyNTM3NDJ9.lF4mkeZUwHpxq9UjCsy8iZj_MmxGM3w142_avufEIrA	2025-11-27 14:29:02.387	2025-11-20 14:29:02.388
75	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzNjQ5ODMwLCJleHAiOjE3NjQyNTQ2MzB9.df4vwjEDEe9FG-2Vb3vtskxY7S6oGKF1yxhQAfN4Qnw	2025-11-27 14:43:50.513	2025-11-20 14:43:50.515
76	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzNjUwMjAwLCJleHAiOjE3NjQyNTUwMDB9.MVy-PZFMgqXs4M6daGP5tIYWMGUv3dtwa7T7MOD9LzI	2025-11-27 14:50:00.958	2025-11-20 14:50:00.961
77	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjM2NTA5NzIsImV4cCI6MTc2NDI1NTc3Mn0.62EhmfP7pVnQKC6rwuhglNRvMDfdtE2HhgEXzw2L5mo	2025-11-27 15:02:52.173	2025-11-20 15:02:52.174
78	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzNjUyMjI3LCJleHAiOjE3NjQyNTcwMjd9.hBfT0We1F_fdiGjg6yf7e0o2jG6eFZFQfC8t0vgTrNQ	2025-11-27 15:23:47.402	2025-11-20 15:23:47.404
79	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzNjUyNzM4LCJleHAiOjE3NjQyNTc1Mzh9.ryIPAFEyBrjDJppDf8ducg60_FDwv3gV_wVN5OE2EQ4	2025-11-27 15:32:18.528	2025-11-20 15:32:18.529
80	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzNjUyOTU4LCJleHAiOjE3NjQyNTc3NTh9.x-OylkrvNszxk1DIAzQ2mmaj_7eVD4drxmghbwVolNc	2025-11-27 15:35:58.284	2025-11-20 15:35:58.286
81	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzNjUzMjA5LCJleHAiOjE3NjQyNTgwMDl9.ESvKd5KsceBl5AJ8DNSyaqWOYjFrpMV8s18Pkgv8V-E	2025-11-27 15:40:09.768	2025-11-20 15:40:09.773
82	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzNjU0MTIzLCJleHAiOjE3NjQyNTg5MjN9.eE04JDQghYEzKP9LS-Euz404O9uM-kDoYMXwFtQ_KMM	2025-11-27 15:55:23.674	2025-11-20 15:55:23.683
83	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzNjU0NDQyLCJleHAiOjE3NjQyNTkyNDJ9.zzVosvTUs0oBX_TpTb8oLT2n6mdUPqhtHoAc0P8IyCc	2025-11-27 16:00:42.75	2025-11-20 16:00:42.755
84	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzNjU0NTQwLCJleHAiOjE3NjQyNTkzNDB9.W1FNM-GTe3TVpty7oTuipJDv6jwL-c5LmFureSrF1yw	2025-11-27 16:02:20.255	2025-11-20 16:02:20.257
85	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzNjU1MzQ4LCJleHAiOjE3NjQyNjAxNDh9.9Fs8LrpWxUDii-yZM6X3j-XnX_xGpKe0OQJnFmqJkqw	2025-11-27 16:15:48.788	2025-11-20 16:15:48.79
86	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzNjU1NTc3LCJleHAiOjE3NjQyNjAzNzd9.qJpartaOAoQsHNTGfFNV1e7Rs6iJvcys7r0kRyqJk3Q	2025-11-27 16:19:37.703	2025-11-20 16:19:37.705
87	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzNjU1ODM4LCJleHAiOjE3NjQyNjA2Mzh9.TsjbgIbQ7iorDZisVNLsC90-JH_VJN_qoaWc9huCA4M	2025-11-27 16:23:58.242	2025-11-20 16:23:58.245
88	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzNzM1OTUzLCJleHAiOjE3NjQzNDA3NTN9.mw_GQhgMQGjyOFJ07_cORNrbUIK_vqaLS4JayWU3XBA	2025-11-28 14:39:13.236	2025-11-21 14:39:13.245
89	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzNzM3ODQ1LCJleHAiOjE3NjQzNDI2NDV9.YmIoLE4h4e0WHfBAXcus_zN1H_td29OJg6_aXMzbB6Q	2025-11-28 15:10:45.007	2025-11-21 15:10:45.013
90	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzNzM4NzU4LCJleHAiOjE3NjQzNDM1NTh9.vQiiW4F4Zz_7S2KVgfU1zL-Xgwd1CrV0LfrlgihfCtg	2025-11-28 15:25:58.075	2025-11-21 15:25:58.079
91	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzNzM4ODQ0LCJleHAiOjE3NjQzNDM2NDR9.2oFBzt_IDYRHCTbYqssLaX5z0ZSHm-8MrKKGP8L97UM	2025-11-28 15:27:24.397	2025-11-21 15:27:24.399
92	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzNzM5MjY2LCJleHAiOjE3NjQzNDQwNjZ9.h6EUgcKBp9EEj2xrsYbikRJdfcAT2nAdUo-_36UDqgk	2025-11-28 15:34:26.077	2025-11-21 15:34:26.082
93	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzNzM5NzMzLCJleHAiOjE3NjQzNDQ1MzN9.H3wSJdLULC3EXUMGb9kPO8PJfnIu8dcJDsI1ToCzw-U	2025-11-28 15:42:13.439	2025-11-21 15:42:13.441
94	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzNzM5ODE3LCJleHAiOjE3NjQzNDQ2MTd9.zQdm12eZoM3o8gLP4vI9zhrrid8zhoHuLEKuKH7d3R0	2025-11-28 15:43:37.018	2025-11-21 15:43:37.02
95	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzNzQwMzU5LCJleHAiOjE3NjQzNDUxNTl9.Hxqw3a25nOMdFqzIAAcntrGNDMypquXtXqUSdNa8KBE	2025-11-28 15:52:39.35	2025-11-21 15:52:39.352
96	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzNzQxNTAxLCJleHAiOjE3NjQzNDYzMDF9.zYATjHxzFWieG1CWYeOKaipWhBs9GsZMmpp0-yOAqPo	2025-11-28 16:11:41.267	2025-11-21 16:11:41.269
97	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjM3NDE3MTYsImV4cCI6MTc2NDM0NjUxNn0.LymvaeNPekc2yNeWSJBkThT0YwDd9CicacuNUDrFpc4	2025-11-28 16:15:16.242	2025-11-21 16:15:16.243
98	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzNzQyMTExLCJleHAiOjE3NjQzNDY5MTF9.X7dJT2AQ9FxJJp1H2Z4MpeehK8IrYSiVGAUHGfKpCwE	2025-11-28 16:21:51.798	2025-11-21 16:21:51.8
99	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzNzQyNTg0LCJleHAiOjE3NjQzNDczODR9.vT8eNPWoN2dko6l3Ee0bOD9bmHghIWpklZYeqerr2uQ	2025-11-28 16:29:44.436	2025-11-21 16:29:44.438
100	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzNzc5NDE0LCJleHAiOjE3NjQzODQyMTR9.TxWbUvD4FOq_BVLufkVQpB1TF4-1zJ7QyiTlzhdRin4	2025-11-29 02:43:34.963	2025-11-22 02:43:34.967
101	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzNzc5NDY3LCJleHAiOjE3NjQzODQyNjd9.NvoZbJttJEAOds9b-kOBePWKAgmR1_uIIo1I0byBFx0	2025-11-29 02:44:27.948	2025-11-22 02:44:27.95
102	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzNzc5NTMyLCJleHAiOjE3NjQzODQzMzJ9.7v-BsfmDc8l5brObgG76wO-skb29cSIp4vX_l2qNXEk	2025-11-29 02:45:32.693	2025-11-22 02:45:32.696
103	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzNzc5NjI3LCJleHAiOjE3NjQzODQ0Mjd9.KLEKw54qSiY3oPz9glGzSFyhsYrVD0HK1Dp2T3oFosY	2025-11-29 02:47:07.913	2025-11-22 02:47:07.914
104	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzNzc5Njk3LCJleHAiOjE3NjQzODQ0OTd9.hSoRRTx2m0o0t7lpRIajBwmX-SnEO3Scz7BA2AVGP9E	2025-11-29 02:48:17.324	2025-11-22 02:48:17.326
105	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzNzgyMTAxLCJleHAiOjE3NjQzODY5MDF9.SyML17vE9O8-hRU5uyk3-3NG6VOMI3ATvMpvC9aYnM8	2025-11-29 03:28:21.934	2025-11-22 03:28:21.94
106	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzNzgyMTY0LCJleHAiOjE3NjQzODY5NjR9.RBZzFdJvPgPM6HFJVZjCjfge6s68UXQyClk91NDEcJE	2025-11-29 03:29:24.76	2025-11-22 03:29:24.761
107	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzNzgzNjM5LCJleHAiOjE3NjQzODg0Mzl9.mml0uP6Umh0uXvpp1g4sHPXRhvNF9_7cVEILWJ-hQn8	2025-11-29 03:53:59.453	2025-11-22 03:53:59.456
108	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzNzg1NDc3LCJleHAiOjE3NjQzOTAyNzd9.0CePOdE72NhXWhmGlfrsU0f5UnF-ETL5Y6f-TVgHQ9E	2025-11-29 04:24:37.248	2025-11-22 04:24:37.251
109	2	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoic2NoYW5uZWxAZ21haWwuY29tIiwidXNlclR5cGUiOiJzZWxsZXIiLCJpYXQiOjE3NjM3ODU2MzEsImV4cCI6MTc2NDM5MDQzMX0.3U6XEMgMTp3OokimLdgPCMTz0U2Omn9hn-H2i99YU1A	2025-11-29 04:27:11.705	2025-11-22 04:27:11.707
110	2	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoic2NoYW5uZWxAZ21haWwuY29tIiwidXNlclR5cGUiOiJzZWxsZXIiLCJpYXQiOjE3NjM3ODYzNzIsImV4cCI6MTc2NDM5MTE3Mn0.fXrxJOaoZ1vMYvHZ3lC5kBUU_7RdYnth2q1JspbdPFo	2025-11-29 04:39:32.575	2025-11-22 04:39:32.58
111	2	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoic2NoYW5uZWxAZ21haWwuY29tIiwidXNlclR5cGUiOiJzZWxsZXIiLCJpYXQiOjE3NjM3ODcwMDEsImV4cCI6MTc2NDM5MTgwMX0.L3e1BNc71LHOBp_c5ywc8uVe2cgMQ59-a-O31YZEtDk	2025-11-29 04:50:01.103	2025-11-22 04:50:01.105
112	2	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoic2NoYW5uZWxAZ21haWwuY29tIiwidXNlclR5cGUiOiJzZWxsZXIiLCJpYXQiOjE3NjM3ODczNjIsImV4cCI6MTc2NDM5MjE2Mn0.L8KdZLG-Bdt1I3pOtvz9BxakAl8I0D7SjwzXI32VnIo	2025-11-29 04:56:02.403	2025-11-22 04:56:02.405
113	2	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoic2NoYW5uZWxAZ21haWwuY29tIiwidXNlclR5cGUiOiJzZWxsZXIiLCJpYXQiOjE3NjM3ODc0MTMsImV4cCI6MTc2NDM5MjIxM30.l-y9aLWZ08TQGgaGFYq3TvPq2qYxXUpOF7Hwa6gxdAs	2025-11-29 04:56:53.057	2025-11-22 04:56:53.059
114	2	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoic2NoYW5uZWxAZ21haWwuY29tIiwidXNlclR5cGUiOiJzZWxsZXIiLCJpYXQiOjE3NjM3ODc2MjgsImV4cCI6MTc2NDM5MjQyOH0.rNGaJK-5P6vkjvu1mFQCrM183_fJdctWUl5038Gp-Bo	2025-11-29 05:00:28.001	2025-11-22 05:00:28.005
115	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzNzg3NjY0LCJleHAiOjE3NjQzOTI0NjR9.djWS3VvU934C16Mybe8kI1LBDPl0UFPRKXJe-j8KMaw	2025-11-29 05:01:04.64	2025-11-22 05:01:04.642
116	2	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoic2NoYW5uZWxAZ21haWwuY29tIiwidXNlclR5cGUiOiJzZWxsZXIiLCJpYXQiOjE3NjM3ODc3MzYsImV4cCI6MTc2NDM5MjUzNn0.8OVW4pjfddPf1Nk7CoEig0LeMea2AtYqVlPAZTx4BAo	2025-11-29 05:02:16.91	2025-11-22 05:02:16.911
117	2	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoic2NoYW5uZWxAZ21haWwuY29tIiwidXNlclR5cGUiOiJzZWxsZXIiLCJpYXQiOjE3NjM3ODc4MzYsImV4cCI6MTc2NDM5MjYzNn0.CeuYfc_EnxssjYtx56o3aKmf-qrZEGhCZMfv9iTian8	2025-11-29 05:03:56.005	2025-11-22 05:03:56.008
118	2	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoic2NoYW5uZWxAZ21haWwuY29tIiwidXNlclR5cGUiOiJzZWxsZXIiLCJpYXQiOjE3NjM3ODkyMTcsImV4cCI6MTc2NDM5NDAxN30.j6PratXton2f2B5sff3nmtkwBjsexnhPQfaonFDzqbI	2025-11-29 05:26:57.757	2025-11-22 05:26:57.76
119	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzODIwMDAyLCJleHAiOjE3NjQ0MjQ4MDJ9.u5Ip6Nctp-il5AWL0AN-bJQMivN5mMl7pR-ESSpq9Yw	2025-11-29 14:00:02.876	2025-11-22 14:00:02.883
120	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjM4MjEyOTIsImV4cCI6MTc2NDQyNjA5Mn0.KBZyf31jk14_GXJ3fR6EUu2Z8HrnJKwjNrYksLp4aKY	2025-11-29 14:21:32.685	2025-11-22 14:21:32.687
121	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzODIzMzI5LCJleHAiOjE3NjQ0MjgxMjl9.zGCSc3Gfz1O5bRHuLVTdIe3wf7zzEbAkrtKj9ndvimA	2025-11-29 14:55:29.743	2025-11-22 14:55:29.746
122	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzODIzNDM4LCJleHAiOjE3NjQ0MjgyMzh9.FChBLR-6_Q3CREcWRYjUQUQ_x6cXP-nRXjEla4T3XG8	2025-11-29 14:57:18.889	2025-11-22 14:57:18.894
123	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzODIzODI4LCJleHAiOjE3NjQ0Mjg2Mjh9.Oqmxd6MCkh_upmq4w1B_zuxIBMCu4Ub3F9v3Ye3q8G8	2025-11-29 15:03:48.648	2025-11-22 15:03:48.653
124	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzODI0MDYzLCJleHAiOjE3NjQ0Mjg4NjN9.o-JCmGklj9u9hsjHZ1YiAA8ANzZkpvi6uMhNQYAUd54	2025-11-29 15:07:43.521	2025-11-22 15:07:43.524
125	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzODI1MjQ5LCJleHAiOjE3NjQ0MzAwNDl9.VfeqK5ksnqgGZWrzvlGgX9gZdlXh4jbPYgy8Ly8rP6U	2025-11-29 15:27:29.317	2025-11-22 15:27:29.323
126	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzODI3MTU5LCJleHAiOjE3NjQ0MzE5NTl9.AfUpOzmKeJycvNkTDexc215fYLnaavUdUp9xLt_HLWs	2025-11-29 15:59:19.323	2025-11-22 15:59:19.325
127	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzODI3MjI2LCJleHAiOjE3NjQ0MzIwMjZ9.0hTPQ9aiyoKb0zFKcaOhQ_S4jf8MnWmKfIvn1DzuDAI	2025-11-29 16:00:26.176	2025-11-22 16:00:26.178
128	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzODI4MDQwLCJleHAiOjE3NjQ0MzI4NDB9.1oJIBxvA6StBTN0LhwKxU8wlAxuOgvdM4xpgEpPlPZY	2025-11-29 16:14:00.453	2025-11-22 16:14:00.458
129	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzODI5NDM3LCJleHAiOjE3NjQ0MzQyMzd9.Ru2aGQpNbecUOb_rIHcDDr6GJ70tN-C5ujMdH1xvrwA	2025-11-29 16:37:17.624	2025-11-22 16:37:17.626
130	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzODMwMzg1LCJleHAiOjE3NjQ0MzUxODV9.O-3Er9zdRaF9xbNB_FuJxwc87cpF0LZyouQjXW9t53Q	2025-11-29 16:53:05.384	2025-11-22 16:53:05.385
131	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzODMwNzUyLCJleHAiOjE3NjQ0MzU1NTJ9.7H8j2uJHn1RjbdSHBCt5AqzAIsF8RcjXmEvydyMiYWg	2025-11-29 16:59:12.4	2025-11-22 16:59:12.401
132	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzODMwODE1LCJleHAiOjE3NjQ0MzU2MTV9.iU0xn3n5oN6OXNyL8T-3DDxs8JB-WgBBTHWWjlOg2D0	2025-11-29 17:00:15.644	2025-11-22 17:00:15.647
133	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjM5ODEyMjEsImV4cCI6MTc2NDU4NjAyMX0.-Wg7bpjk2KBSz2i-N_ZHQV787Av0EKx7wJBKCMrGP9Y	2025-12-01 10:47:01.688	2025-11-24 10:47:01.694
134	2	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoic2NoYW5uZWxAZ21haWwuY29tIiwidXNlclR5cGUiOiJzZWxsZXIiLCJpYXQiOjE3NjM5ODEzNTcsImV4cCI6MTc2NDU4NjE1N30.GI-OLiGtVT7bjS0AIm89YFsSRevjbbK4azA56F4Za6g	2025-12-01 10:49:17.614	2025-11-24 10:49:17.617
135	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjM5ODE0MjQsImV4cCI6MTc2NDU4NjIyNH0.pu3Ct6fsYyo7l5Fl3s6RvHjJ76QrvaA8IfmprLHg7hA	2025-12-01 10:50:24.545	2025-11-24 10:50:24.547
136	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzOTgxODY2LCJleHAiOjE3NjQ1ODY2NjZ9.rHTDkpMrH0rftQqUDmLMR9eNDycFBS3e5Uu_ZZw9Hac	2025-12-01 10:57:46.912	2025-11-24 10:57:46.915
137	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzOTgyNTk3LCJleHAiOjE3NjQ1ODczOTd9.c5y6pJcegSi933bGXWMw6V_HQUGFaw4CFs3ZAZBaXsU	2025-12-01 11:09:57.16	2025-11-24 11:09:57.162
138	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzOTgzMDY5LCJleHAiOjE3NjQ1ODc4Njl9.LKTm0sEsto9gUBBLlaawS8oP57OOVtDXDfBVo7mM6t0	2025-12-01 11:17:49.293	2025-11-24 11:17:49.294
139	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzOTgzNDY1LCJleHAiOjE3NjQ1ODgyNjV9.HefZKvWLbUsnsVEijKTWMdCz8BjhswaXIEB1SyvRXgw	2025-12-01 11:24:25.541	2025-11-24 11:24:25.543
140	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzOTg0MDEzLCJleHAiOjE3NjQ1ODg4MTN9.KzkkFUF8QlyQNsP0R6eo19c88xiWQKZPztO6sEPJIIg	2025-12-01 11:33:33.829	2025-11-24 11:33:33.831
141	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzOTg3ODkzLCJleHAiOjE3NjQ1OTI2OTN9.VqBBzlONa27TBtvpilaDsf7Pk0vxsJYMUc3u0Bo5OTQ	2025-12-01 12:38:13.559	2025-11-24 12:38:13.566
142	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzOTg4MjU2LCJleHAiOjE3NjQ1OTMwNTZ9.Xy4gn4wbrpe2Xcv5UbdFk-QIGT_3irmTYvX0YIPq7EU	2025-12-01 12:44:16.486	2025-11-24 12:44:16.488
143	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzOTg5Mjg2LCJleHAiOjE3NjQ1OTQwODZ9.4cBXA8pLxhedrNyo49yWpASExczsohZGAGHb2dRNwjs	2025-12-01 13:01:26.028	2025-11-24 13:01:26.03
144	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzOTg5NjYwLCJleHAiOjE3NjQ1OTQ0NjB9.1mmlW9InZW58DWFzzXysj6moT2sEOBZbMigiShRU7Os	2025-12-01 13:07:40.452	2025-11-24 13:07:40.454
145	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzOTkwMDkwLCJleHAiOjE3NjQ1OTQ4OTB9.0-5uhCO4oBFdnylJ3fKOl24giAP9peEv0STuYLaV_BE	2025-12-01 13:14:50.419	2025-11-24 13:14:50.421
146	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzOTkwNTA4LCJleHAiOjE3NjQ1OTUzMDh9.EgyDf22fBK1B1yPptpTdv4D0FiBDSCW4ZkjqPMhVI4I	2025-12-01 13:21:48.322	2025-11-24 13:21:48.325
147	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzOTkwNzA0LCJleHAiOjE3NjQ1OTU1MDR9.6zo10VhrXEKmTXa13N6bQbDuI71obxH2owcJ40ds7Lw	2025-12-01 13:25:04.606	2025-11-24 13:25:04.609
148	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzOTkxMDA3LCJleHAiOjE3NjQ1OTU4MDd9.n4AmCo6rSRmQAVEkvn9_tkbR1b0nXAftpD1NsKHIIpA	2025-12-01 13:30:07.438	2025-11-24 13:30:07.439
149	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzOTkxNDAxLCJleHAiOjE3NjQ1OTYyMDF9.rN4ENrgrvmRayU6l9q8tFdazkzmDFOCfm24lej38XBY	2025-12-01 13:36:41.822	2025-11-24 13:36:41.824
150	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzOTkxNTAwLCJleHAiOjE3NjQ1OTYzMDB9.3sa_IO3z116PGWi-IkKZo9yI2UeJhdgNi1ILCu2ON-s	2025-12-01 13:38:20.345	2025-11-24 13:38:20.349
151	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzOTkxNzE0LCJleHAiOjE3NjQ1OTY1MTR9.qXlBad6_6XmarHFL3LgvlZAATAjDml-bR9-EZVMJs7A	2025-12-01 13:41:54.533	2025-11-24 13:41:54.535
152	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjM5OTI1MzYsImV4cCI6MTc2NDU5NzMzNn0.q0m-whz0PL9HXNraBoHWR1dhy2xJ0wvF6rfDK7zN1h8	2025-12-01 13:55:36.415	2025-11-24 13:55:36.419
153	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzOTkyNjc0LCJleHAiOjE3NjQ1OTc0NzR9.6Xr0yGSS9rC7PRTsXsjXZLv2W2OU3yTkAS027Cx5WI4	2025-12-01 13:57:54.542	2025-11-24 13:57:54.543
154	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjM5OTI3MDIsImV4cCI6MTc2NDU5NzUwMn0.rSDMnI3YmpSvJsjB6nyWHGD8ncYXtV52Bev5iLAsic8	2025-12-01 13:58:22.033	2025-11-24 13:58:22.036
155	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjM5OTM2OTksImV4cCI6MTc2NDU5ODQ5OX0.c3gyV6xtnc8gPUQXQzgk1XPtbCXabt-9jockS6t_vK8	2025-12-01 14:14:59.117	2025-11-24 14:14:59.119
156	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjM5OTQyODksImV4cCI6MTc2NDU5OTA4OX0.zneMxP3mWCSUko54nH3MPSOBjwMwCNsZkm4UPAPUum0	2025-12-01 14:24:49.596	2025-11-24 14:24:49.6
157	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjM5OTUzNDIsImV4cCI6MTc2NDYwMDE0Mn0.-psSGee8acUGsG6n_Qk_c8TQu1c9Lq1pF5TuiefjYd0	2025-12-01 14:42:22.238	2025-11-24 14:42:22.24
158	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzOTk3Nzg5LCJleHAiOjE3NjQ2MDI1ODl9.vAAQNcyjHTQXV2ni3eKcqvXcC-xQYBEX8orPf8_NTaw	2025-12-01 15:23:09.333	2025-11-24 15:23:09.337
159	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzOTk3ODg4LCJleHAiOjE3NjQ2MDI2ODh9.PJAxciFv0y8Vx0dNVC5WK0cn-PlUwwXP-qIG7t4aOxw	2025-12-01 15:24:48.455	2025-11-24 15:24:48.457
160	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzOTk4MTQ5LCJleHAiOjE3NjQ2MDI5NDl9.PoCg74daLQeOKHKTDRgMqXnURET9OW5C9cDumD88k-Y	2025-12-01 15:29:09.5	2025-11-24 15:29:09.502
161	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzOTk4Mjg1LCJleHAiOjE3NjQ2MDMwODV9.mFTffwi_xQkQO7AucC7LF8YQxNBtgU8Y06XpgcZBtbQ	2025-12-01 15:31:25.027	2025-11-24 15:31:25.029
162	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjM5OTg2NjksImV4cCI6MTc2NDYwMzQ2OX0.RVSrEQg2V9haBxzJ25yFWep_g5HphtKsMXosZ1iMnZ8	2025-12-01 15:37:49.622	2025-11-24 15:37:49.624
163	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzOTk5MDY1LCJleHAiOjE3NjQ2MDM4NjV9.DVQT21IHz_QVxLQt9Mm15VaKs-TM5JKx0Y9rTaBKq18	2025-12-01 15:44:25.269	2025-11-24 15:44:25.273
164	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzOTk5Njk3LCJleHAiOjE3NjQ2MDQ0OTd9.aFXXoB0znZL_qLrIwLerCThC7AGe15A4N2TNprfehZ4	2025-12-01 15:54:57.186	2025-11-24 15:54:57.188
165	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzOTk5ODE1LCJleHAiOjE3NjQ2MDQ2MTV9.8lEnl9Q6HXY_Vfgd8myb8Ush4s5i50XhH42ZOpUMpso	2025-12-01 15:56:55.645	2025-11-24 15:56:55.647
166	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzYzOTk5OTE1LCJleHAiOjE3NjQ2MDQ3MTV9.d7clo6h5TqsNLxAv1f2tF6KP9Cq8kBDIeuOtdVVPUVc	2025-12-01 15:58:35.503	2025-11-24 15:58:35.504
167	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzY0MDAwMDY0LCJleHAiOjE3NjQ2MDQ4NjR9.hm4ppk6pRgMFklpRcCHECo7ypDWLk1PH7l-Ks-h_KQw	2025-12-01 16:01:04.691	2025-11-24 16:01:04.692
168	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjQwMDAxMjAsImV4cCI6MTc2NDYwNDkyMH0.T3F-7juttPHVE8DoA3ajcabrNcTiAIuFVw6LqYHSwjk	2025-12-01 16:02:00.507	2025-11-24 16:02:00.509
169	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzY0MDM0MzQyLCJleHAiOjE3NjQ2MzkxNDJ9.XlPVvhz72yxdD1QvV1Mx7Il7UAvlZN2YE48bRjZyk70	2025-12-02 01:32:22.949	2025-11-25 01:32:22.954
170	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzY0MDM0NDMyLCJleHAiOjE3NjQ2MzkyMzJ9.L9w90YekaGIRdhpyD8pWajvF5WoDpgjSQMbIdC9PEB0	2025-12-02 01:33:52.237	2025-11-25 01:33:52.239
171	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzY0MDM1MDYxLCJleHAiOjE3NjQ2Mzk4NjF9.7qcXvWkpC_P69qDZgdjgPqCmsy-v61_nLyq_beIKGOc	2025-12-02 01:44:21.027	2025-11-25 01:44:21.028
172	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzY0MDM1NDExLCJleHAiOjE3NjQ2NDAyMTF9.K_bqsSbBpqKXIstQBNhZQg0MXjEHAKL3f03Y0jdp98Q	2025-12-02 01:50:11.99	2025-11-25 01:50:11.989
173	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjQwMzU0NjgsImV4cCI6MTc2NDY0MDI2OH0.fsQ0ciy-tOs5EOjoPw_TKN2uS50hE-W3zEFgwkVENUc	2025-12-02 01:51:08.535	2025-11-25 01:51:08.538
174	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzY0MDM1NzQ0LCJleHAiOjE3NjQ2NDA1NDR9.O1Zt0SdedFI0foCWyQOjU6tU-Uhh50HOicz5QZRpmHs	2025-12-02 01:55:44.798	2025-11-25 01:55:44.801
175	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjQwMzU4NjEsImV4cCI6MTc2NDY0MDY2MX0.yZtTtqKI5Wx7NE51NhZ0_kfHjzb9Pgx8pgX8yKcW058	2025-12-02 01:57:41.496	2025-11-25 01:57:41.493
176	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjQwMzU5NTUsImV4cCI6MTc2NDY0MDc1NX0.mRnvrydt2TFRaoWzzqkBv4eV3QfusjE04SZ0w6Xp2Ng	2025-12-02 01:59:15.762	2025-11-25 01:59:15.759
177	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzY0MDM3OTg4LCJleHAiOjE3NjQ2NDI3ODh9.pqFWra7WZ5KObtKjRwDrzyiPY9MawPWR7sn-2tJEQ_Y	2025-12-02 02:33:08.659	2025-11-25 02:33:08.665
178	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzY0MDM4MDI0LCJleHAiOjE3NjQ2NDI4MjR9.UDjsVskEsgelYSMAXmAFXrgRRSjnEcdQevASq6jWUKA	2025-12-02 02:33:44.762	2025-11-25 02:33:44.762
179	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzY0MDM4MTA0LCJleHAiOjE3NjQ2NDI5MDR9.x-2XD0j2cdFJ84uQ44igafqlyebAR-8oUBNw-IUc57E	2025-12-02 02:35:04.057	2025-11-25 02:35:04.059
180	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzY0MDM4NDQ0LCJleHAiOjE3NjQ2NDMyNDR9.qQz0GIoyUX14j-LlmZFt6_A3fSLRpJ2ju5WanafoQb8	2025-12-02 02:40:44.562	2025-11-25 02:40:44.562
181	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzY0MDM5NDQyLCJleHAiOjE3NjQ2NDQyNDJ9.s6cAzOMsbK_ie2rDPtOeg712ozTDJgrQ9rnWbwpPgDo	2025-12-02 02:57:22.325	2025-11-25 02:57:22.327
182	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzY0MDQwNDM2LCJleHAiOjE3NjQ2NDUyMzZ9.2MahZ04YRtCzuO7HkDdDxeNJwclZT91ICfc07PMlN-8	2025-12-02 03:13:56.679	2025-11-25 03:13:56.682
183	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzY0MDQwNDcwLCJleHAiOjE3NjQ2NDUyNzB9.wUpM1Tnjw9IC4gdGlcXGs96ujIlDq6wYxcAzb_HGBNY	2025-12-02 03:14:30.724	2025-11-25 03:14:30.725
184	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjQwNDA1MjQsImV4cCI6MTc2NDY0NTMyNH0.8RTp3uHJlRlfRsNa8kqLUp6udn7vqlIqhqhrdwDNU9E	2025-12-02 03:15:24.664	2025-11-25 03:15:24.667
185	2	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoic2NoYW5uZWxAZ21haWwuY29tIiwidXNlclR5cGUiOiJzZWxsZXIiLCJpYXQiOjE3NjQwNDE3NDAsImV4cCI6MTc2NDY0NjU0MH0.tpTo05EyPwe91nmd_ud_OCOsKOC2EOvCGl4T5vwP0DY	2025-12-02 03:35:40.173	2025-11-25 03:35:40.18
186	2	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoic2NoYW5uZWxAZ21haWwuY29tIiwidXNlclR5cGUiOiJzZWxsZXIiLCJpYXQiOjE3NjQwNDI5MjksImV4cCI6MTc2NDY0NzcyOX0.bdzDcZ6411voenNzl5p0ThRjJG04iggWSKMMWZRbkN0	2025-12-02 03:55:29.812	2025-11-25 03:55:29.817
187	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzY0MDQyOTUxLCJleHAiOjE3NjQ2NDc3NTF9.J7J0l1KbsOEcX_Gr5QkcmQReTjkbO1uoJi5y0FqT1ms	2025-12-02 03:55:51.806	2025-11-25 03:55:51.807
188	2	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoic2NoYW5uZWxAZ21haWwuY29tIiwidXNlclR5cGUiOiJzZWxsZXIiLCJpYXQiOjE3NjQwNDMwMDAsImV4cCI6MTc2NDY0NzgwMH0.L1n4nmxnZdGZ5b3BsTCfImEQk4ueSmNXou-yWXVoNPE	2025-12-02 03:56:40.381	2025-11-25 03:56:40.385
189	2	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoic2NoYW5uZWxAZ21haWwuY29tIiwidXNlclR5cGUiOiJzZWxsZXIiLCJpYXQiOjE3NjQwODIyMjIsImV4cCI6MTc2NDY4NzAyMn0.pCofrqNDxHXoON0MD3_KCDWEcTpRc8fh3s7zId3UO6Y	2025-12-02 14:50:22.336	2025-11-25 14:50:22.342
190	2	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoic2NoYW5uZWxAZ21haWwuY29tIiwidXNlclR5cGUiOiJzZWxsZXIiLCJpYXQiOjE3NjQxNjk4MzksImV4cCI6MTc2NDc3NDYzOX0.igRcV5i4hCORGbTkzW4IVQLXRQDbyKL-lcblW2qce3w	2025-12-03 15:10:39.629	2025-11-26 15:10:39.634
191	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzY0MTcwMzk3LCJleHAiOjE3NjQ3NzUxOTd9.harmfmXoDsGM-JnDh8jXRO5E8fSZEPJG0q0ymC08_GE	2025-12-03 15:19:57.678	2025-11-26 15:19:57.68
192	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjQxNzA1MTQsImV4cCI6MTc2NDc3NTMxNH0.Stw5weG80yW0-_3PgwoRFMo3jo6-Yi5giDtgCLY0tFQ	2025-12-03 15:21:54.43	2025-11-26 15:21:54.432
193	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjQxNzA2MjksImV4cCI6MTc2NDc3NTQyOX0.uKTo1q_g7zVnhH2yO4793l77aBPwqid5Tb54rhGQ64E	2025-12-03 15:23:49.314	2025-11-26 15:23:49.316
194	4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImVtYWlsIjoid29hdHN1QGdtYWlsLmNvbSIsInVzZXJUeXBlIjoic2VsbGVyIiwiaWF0IjoxNzY0MTcwNzMxLCJleHAiOjE3NjQ3NzU1MzF9.bc2ibH4nJEBBn5lOEZMbI8DeRXVyS2BPQ-aNt-owYRU	2025-12-03 15:25:31.724	2025-11-26 15:25:31.726
195	5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUsImVtYWlsIjoiamVubmllQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoic2VsbGVyIiwiaWF0IjoxNzY0MTcxNzYzLCJleHAiOjE3NjQ3NzY1NjN9.OePUgpzTwAHPOiYLDxd9pP5pBryPzbzpO3nvMc9cWCk	2025-12-03 15:42:43.829	2025-11-26 15:42:43.831
196	5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUsImVtYWlsIjoiamVubmllQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoic2VsbGVyIiwiaWF0IjoxNzY0MTcxOTk4LCJleHAiOjE3NjQ3NzY3OTh9.J3b0FB10r4bJ_TdiJDjHC0OQ5qbe9yFgt-VzSMoXiec	2025-12-03 15:46:38.088	2025-11-26 15:46:38.09
197	2	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoic2NoYW5uZWxAZ21haWwuY29tIiwidXNlclR5cGUiOiJzZWxsZXIiLCJpYXQiOjE3NjQxNzIwNTAsImV4cCI6MTc2NDc3Njg1MH0.37Vo1IbSx937zCUhn8gMxA6Be4r6lG6aPMQAJ533fHE	2025-12-03 15:47:30.02	2025-11-26 15:47:30.023
198	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjQxNzIzMjAsImV4cCI6MTc2NDc3NzEyMH0.lS6eY7SIu0HHh2so3fwd_oCs-l4EKZW7fXfFqGL2QDY	2025-12-03 15:52:00.432	2025-11-26 15:52:00.434
199	6	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjYsImVtYWlsIjoidGh1b25nQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjQxNzI2NDQsImV4cCI6MTc2NDc3NzQ0NH0.f2TOWg0NT6oLUCfvO63ELvadLRrb-igSS6ILAhs4UDI	2025-12-03 15:57:24.371	2025-11-26 15:57:24.372
200	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjQyOTI5NzQsImV4cCI6MTc2NDg5Nzc3NH0.yHrlcZoic42HxaDpWpM9YAs1H1Yu-NFuPTulKR7lXow	2025-12-05 01:22:54.194	2025-11-28 01:22:54.201
201	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjQyOTMwMDYsImV4cCI6MTc2NDg5NzgwNn0.xNGK_QJe1Osf8hdFiXxXEdNHW-5U-7EN35OLdqE2F8Y	2025-12-05 01:23:26.937	2025-11-28 01:23:26.94
202	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjQyOTM2NTgsImV4cCI6MTc2NDg5ODQ1OH0.fox5lISVdJdhUbDoQ35eeYPRnkUVOWeNI0G5dDYL1TU	2025-12-05 01:34:18.69	2025-11-28 01:34:18.693
203	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzY0MjkzODA2LCJleHAiOjE3NjQ4OTg2MDZ9.ZVjU9qSvkjzeYGY0RoZlqjXe5JA3f_J_reoNJ6e8wtY	2025-12-05 01:36:46.807	2025-11-28 01:36:46.81
204	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzY0Mjk0MTY0LCJleHAiOjE3NjQ4OTg5NjR9.RwMHgo0EZniihBOm08-w28_4kXFRXaBagdFEcpZX1QE	2025-12-05 01:42:44.861	2025-11-28 01:42:44.868
205	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzY0Mjk0NDM2LCJleHAiOjE3NjQ4OTkyMzZ9.MDteSKZMC2_IlCrroS83O3mCJAp7vASfv9sA2NE7s2s	2025-12-05 01:47:16.115	2025-11-28 01:47:16.117
206	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzY0Mjk0Njg5LCJleHAiOjE3NjQ4OTk0ODl9.tzJ8LRG1stmZJXcQo500VVSC0TYzBEoU1hW9_EHZJyo	2025-12-05 01:51:29.538	2025-11-28 01:51:29.54
207	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzY0Mjk0OTE1LCJleHAiOjE3NjQ4OTk3MTV9.nG4Sv38rHQBJcpLl1nyJQN4nJ8vUYbUTm6BGl2oH620	2025-12-05 01:55:15.54	2025-11-28 01:55:15.542
208	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzY0Mjk1MTQzLCJleHAiOjE3NjQ4OTk5NDN9.c3IoFk1d9U5ni0VYvUGvGs9p_HkuFIFNzv5AyhjLV2A	2025-12-05 01:59:03.558	2025-11-28 01:59:03.566
209	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjQyOTUyMTYsImV4cCI6MTc2NDkwMDAxNn0.9DPzfCVMFQwiClpQo97QN7N276JdJcK5Fndp0tGLLRU	2025-12-05 02:00:16.707	2025-11-28 02:00:16.709
210	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjQyOTU0MTQsImV4cCI6MTc2NDkwMDIxNH0.pXTl39HEq7FaEa02cDbLMa4kfzMCqJO2rfKaj7TyPVI	2025-12-05 02:03:34.942	2025-11-28 02:03:34.943
211	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzY0Mjk1NjMzLCJleHAiOjE3NjQ5MDA0MzN9.H6Tp5AEEYkIadWeZ-3xTC6GzO8kgQxWufpG9py3nbhw	2025-12-05 02:07:13.924	2025-11-28 02:07:13.927
212	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmhpQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NjQyOTU2NTcsImV4cCI6MTc2NDkwMDQ1N30.r4bdvOyBimcLO1mvDlItpRQjeY-FVDnHULAfDSHXPO0	2025-12-05 02:07:37.726	2025-11-28 02:07:37.727
213	3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoicXVhbkBnbWFpbC5jb20iLCJ1c2VyVHlwZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzY0Mjk1NzE4LCJleHAiOjE3NjQ5MDA1MTh9.tyM4g7-cc0yqVq3c4wvB-78xGSr7BYp-dcoVNHrV8vI	2025-12-05 02:08:38.817	2025-11-28 02:08:38.819
\.


--
-- TOC entry 4972 (class 0 OID 17887)
-- Dependencies: 231
-- Data for Name: spaylater_customers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spaylater_customers (id, user_id, credit_limit, available_credit, used_credit, total_paid, total_overdue, is_active, kyc_status, bank_account, bank_name, created_at, updated_at) FROM stdin;
2	1	2000000.00	1660000.00	340000.00	0.00	0.00	t	APPROVED	540188862	Vietcombank	2025-11-16 04:56:32.103	2025-11-18 16:08:13.954
3	3	2000000.00	1445000.00	555000.00	0.00	0.00	t	APPROVED	540384932	VietinBank	2025-11-19 02:13:49.521	2025-11-19 02:51:12.183
\.


--
-- TOC entry 4976 (class 0 OID 17918)
-- Dependencies: 235
-- Data for Name: spaylater_payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spaylater_payments (id, transaction_id, customer_id, amount, payment_method, payment_date, status, metadata, created_at) FROM stdin;
\.


--
-- TOC entry 4974 (class 0 OID 17904)
-- Dependencies: 233
-- Data for Name: spaylater_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spaylater_transactions (id, customer_id, order_id, amount, paid_amount, purchase_date, due_date, status, late_fee, metadata, created_at, updated_at) FROM stdin;
1	2	7	185000.00	0.00	2025-10-19 03:17:52.008	2025-11-19 03:17:52.007	PENDING	0.00	\N	2025-10-19 03:17:52.008	2025-10-19 03:17:52.008
2	3	8	185000.00	0.00	2025-11-19 03:59:36.186	2025-12-19 03:59:36.185	PENDING	0.00	\N	2025-11-19 03:59:36.186	2025-11-19 03:59:36.186
\.


--
-- TOC entry 4960 (class 0 OID 17818)
-- Dependencies: 219
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, full_name, email, phone, password_hash, user_type, is_verified, created_at, updated_at, avatar) FROM stdin;
2	Schannel	schannel@gmail.com	012345678	$2b$10$yY/W.E7T9MXoL9mJi3zZu.rIMdad/l29Q6GXTBh1JTmeyp2yUVEB2	seller	f	2025-11-15 08:20:28.713	2025-11-15 08:20:28.713	\N
4	Woa.stu	woatsu@gmail.com	0984114178	$2b$10$DJgJ49v5lt4/HlNKkw4cX./0QqNawGe4YaNVkm5RUZnEx1aUajNci	seller	f	2025-11-26 15:25:17.538	2025-11-26 15:25:17.538	\N
5	jennie	jennie@gmail.com	096267323	$2b$10$8tWTdfpV5M82uvcQdjjEoOUk6w5lV4FgJCN79z1BIOk0Zfs7GbEMe	seller	f	2025-11-26 15:42:26.414	2025-11-26 15:42:26.414	\N
6	thithuong	thuong@gmail.com	0209384230	$2b$10$L4xB6eXUATbBiu8YVW127ejFC3.AUsuySRhlnezCRaX0Vx.YrKrrC	customer	f	2025-11-26 15:57:06.633	2025-11-26 15:57:06.633	\N
3	PhiQuan	quan@gmail.com	0983823489	$2b$10$YwkLMRINwv7fLE6YtIqzP.jhhRrHx27g35ukHzSK4etX7TUEHtaR.	customer	f	2025-11-16 05:35:10.283	2025-11-28 01:43:38.969	https://res.cloudinary.com/dnui1a2v5/image/upload/v1764294193/ecomira/products/xkdthheu3d91qpxzg21e.png
1	nhithao	nhi@gmail.com	0348990415	$2b$10$PE4C.MkLjJS.vxvp5czOeu4jkny/Tm0ZHO4wtS/SOWMOb03MLKfqG	customer	f	2025-11-15 08:17:47.464	2025-11-28 02:08:16.344	https://res.cloudinary.com/dnui1a2v5/image/upload/v1764295252/ecomira/products/bvt8z3lmkerzrc0zn8qw.png
\.


--
-- TOC entry 4996 (class 0 OID 0)
-- Dependencies: 224
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categories_id_seq', 1, false);


--
-- TOC entry 4997 (class 0 OID 0)
-- Dependencies: 236
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_id_seq', 10, true);


--
-- TOC entry 4998 (class 0 OID 0)
-- Dependencies: 228
-- Name: order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_items_id_seq', 65, true);


--
-- TOC entry 4999 (class 0 OID 0)
-- Dependencies: 226
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.orders_id_seq', 64, true);


--
-- TOC entry 5000 (class 0 OID 0)
-- Dependencies: 222
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.products_id_seq', 6, true);


--
-- TOC entry 5001 (class 0 OID 0)
-- Dependencies: 220
-- Name: sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sessions_id_seq', 213, true);


--
-- TOC entry 5002 (class 0 OID 0)
-- Dependencies: 230
-- Name: spaylater_customers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spaylater_customers_id_seq', 3, true);


--
-- TOC entry 5003 (class 0 OID 0)
-- Dependencies: 234
-- Name: spaylater_payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spaylater_payments_id_seq', 1, false);


--
-- TOC entry 5004 (class 0 OID 0)
-- Dependencies: 232
-- Name: spaylater_transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spaylater_transactions_id_seq', 2, true);


--
-- TOC entry 5005 (class 0 OID 0)
-- Dependencies: 218
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 6, true);


--
-- TOC entry 4754 (class 2606 OID 17748)
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 4771 (class 2606 OID 17862)
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- TOC entry 4799 (class 2606 OID 18045)
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 4780 (class 2606 OID 17885)
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- TOC entry 4776 (class 2606 OID 17875)
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- TOC entry 4768 (class 2606 OID 17851)
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- TOC entry 4761 (class 2606 OID 17837)
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- TOC entry 4784 (class 2606 OID 17902)
-- Name: spaylater_customers spaylater_customers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spaylater_customers
    ADD CONSTRAINT spaylater_customers_pkey PRIMARY KEY (id);


--
-- TOC entry 4796 (class 2606 OID 17928)
-- Name: spaylater_payments spaylater_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spaylater_payments
    ADD CONSTRAINT spaylater_payments_pkey PRIMARY KEY (id);


--
-- TOC entry 4791 (class 2606 OID 17916)
-- Name: spaylater_transactions spaylater_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spaylater_transactions
    ADD CONSTRAINT spaylater_transactions_pkey PRIMARY KEY (id);


--
-- TOC entry 4758 (class 2606 OID 17827)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4778 (class 1259 OID 17942)
-- Name: order_items_order_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_items_order_id_idx ON public.order_items USING btree (order_id);


--
-- TOC entry 4781 (class 1259 OID 17943)
-- Name: order_items_product_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_items_product_id_idx ON public.order_items USING btree (product_id);


--
-- TOC entry 4782 (class 1259 OID 17944)
-- Name: order_items_seller_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_items_seller_id_idx ON public.order_items USING btree (seller_id);


--
-- TOC entry 4772 (class 1259 OID 17939)
-- Name: orders_customer_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX orders_customer_id_idx ON public.orders USING btree (customer_id);


--
-- TOC entry 4773 (class 1259 OID 17941)
-- Name: orders_order_number_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX orders_order_number_idx ON public.orders USING btree (order_number);


--
-- TOC entry 4774 (class 1259 OID 17938)
-- Name: orders_order_number_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX orders_order_number_key ON public.orders USING btree (order_number);


--
-- TOC entry 4777 (class 1259 OID 17940)
-- Name: orders_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX orders_status_idx ON public.orders USING btree (status);


--
-- TOC entry 4765 (class 1259 OID 17935)
-- Name: products_category_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX products_category_id_idx ON public.products USING btree (category_id);


--
-- TOC entry 4766 (class 1259 OID 17937)
-- Name: products_is_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX products_is_active_idx ON public.products USING btree (is_active);


--
-- TOC entry 4769 (class 1259 OID 17936)
-- Name: products_seller_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX products_seller_id_idx ON public.products USING btree (seller_id);


--
-- TOC entry 4762 (class 1259 OID 17933)
-- Name: sessions_token_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sessions_token_idx ON public.sessions USING btree (token);


--
-- TOC entry 4763 (class 1259 OID 17932)
-- Name: sessions_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX sessions_token_key ON public.sessions USING btree (token);


--
-- TOC entry 4764 (class 1259 OID 17934)
-- Name: sessions_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sessions_user_id_idx ON public.sessions USING btree (user_id);


--
-- TOC entry 4785 (class 1259 OID 17947)
-- Name: spaylater_customers_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX spaylater_customers_user_id_idx ON public.spaylater_customers USING btree (user_id);


--
-- TOC entry 4786 (class 1259 OID 17945)
-- Name: spaylater_customers_user_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX spaylater_customers_user_id_key ON public.spaylater_customers USING btree (user_id);


--
-- TOC entry 4793 (class 1259 OID 17954)
-- Name: spaylater_payments_customer_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX spaylater_payments_customer_id_idx ON public.spaylater_payments USING btree (customer_id);


--
-- TOC entry 4794 (class 1259 OID 17955)
-- Name: spaylater_payments_payment_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX spaylater_payments_payment_date_idx ON public.spaylater_payments USING btree (payment_date);


--
-- TOC entry 4797 (class 1259 OID 17953)
-- Name: spaylater_payments_transaction_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX spaylater_payments_transaction_id_idx ON public.spaylater_payments USING btree (transaction_id);


--
-- TOC entry 4787 (class 1259 OID 17949)
-- Name: spaylater_transactions_customer_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX spaylater_transactions_customer_id_idx ON public.spaylater_transactions USING btree (customer_id);


--
-- TOC entry 4788 (class 1259 OID 17952)
-- Name: spaylater_transactions_due_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX spaylater_transactions_due_date_idx ON public.spaylater_transactions USING btree (due_date);


--
-- TOC entry 4789 (class 1259 OID 17950)
-- Name: spaylater_transactions_order_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX spaylater_transactions_order_id_idx ON public.spaylater_transactions USING btree (order_id);


--
-- TOC entry 4792 (class 1259 OID 17951)
-- Name: spaylater_transactions_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX spaylater_transactions_status_idx ON public.spaylater_transactions USING btree (status);


--
-- TOC entry 4755 (class 1259 OID 17930)
-- Name: users_email_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_email_idx ON public.users USING btree (email);


--
-- TOC entry 4756 (class 1259 OID 17929)
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- TOC entry 4759 (class 1259 OID 17931)
-- Name: users_user_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_user_type_idx ON public.users USING btree (user_type);


--
-- TOC entry 4812 (class 2606 OID 18046)
-- Name: notifications notifications_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4804 (class 2606 OID 17976)
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4805 (class 2606 OID 17981)
-- Name: order_items order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4806 (class 2606 OID 17986)
-- Name: order_items order_items_seller_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4803 (class 2606 OID 17971)
-- Name: orders orders_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4801 (class 2606 OID 17961)
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4802 (class 2606 OID 17966)
-- Name: products products_seller_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4800 (class 2606 OID 17956)
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4807 (class 2606 OID 17991)
-- Name: spaylater_customers spaylater_customers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spaylater_customers
    ADD CONSTRAINT spaylater_customers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4810 (class 2606 OID 18011)
-- Name: spaylater_payments spaylater_payments_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spaylater_payments
    ADD CONSTRAINT spaylater_payments_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.spaylater_customers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4811 (class 2606 OID 18006)
-- Name: spaylater_payments spaylater_payments_transaction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spaylater_payments
    ADD CONSTRAINT spaylater_payments_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.spaylater_transactions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4808 (class 2606 OID 17996)
-- Name: spaylater_transactions spaylater_transactions_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spaylater_transactions
    ADD CONSTRAINT spaylater_transactions_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.spaylater_customers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4809 (class 2606 OID 18001)
-- Name: spaylater_transactions spaylater_transactions_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spaylater_transactions
    ADD CONSTRAINT spaylater_transactions_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4985 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


-- Completed on 2025-11-29 07:52:35

--
-- PostgreSQL database dump complete
--

