USE `ecommerce_db`;

-- ========================================================
-- SEEDS DATA
-- ========================================================

-- 1. ADMIN USER
-- Password is: admin123 (hashed with bcrypt, 10 rounds)
INSERT INTO `admins` (`id`, `username`, `email`, `password_hash`, `full_name`, `role`, `is_active`)
VALUES
(1, 'admin', 'admin@biyodo.com', '$2a$10$/0YjIF9XuspKZiC4uBZes.4/00bs3TNKuKfINU0VoQLSk9nE3mcbm', 'Directeur BIYODO', 'superadmin', 1)
ON DUPLICATE KEY UPDATE `username` = VALUES(`username`);

-- 2. ALL 58 ALGERIAN WILAYAS
INSERT INTO `wilayas` (`id`, `code`, `name`, `name_ar`, `delivery_fee`, `estimated_delivery_days`, `is_active`) VALUES
(1, '01', 'Adrar', 'أدرار', 1000.00, '3-5 jours', 1),
(2, '02', 'Chlef', 'الشلف', 600.00, '1-3 jours', 1),
(3, '03', 'Laghouat', 'الأغواط', 700.00, '2-4 jours', 1),
(4, '04', 'Oum El Bouaghi', 'أم البواقي', 650.00, '2-4 jours', 1),
(5, '05', 'Batna', 'باتنة', 650.00, '2-3 jours', 1),
(6, '06', 'Béjaïa', 'بجاية', 600.00, '1-3 jours', 1),
(7, '07', 'Biskra', 'بسكرة', 700.00, '2-4 jours', 1),
(8, '08', 'Béchar', 'بشار', 900.00, '3-5 jours', 1),
(9, '09', 'Blida', 'البليدة', 450.00, '1-2 jours', 1),
(10, '10', 'Bouira', 'البويرة', 550.00, '1-3 jours', 1),
(11, '11', 'Tamanrasset', 'تمنراست', 1200.00, '4-6 jours', 1),
(12, '12', 'Tébessa', 'تبسة', 700.00, '2-4 jours', 1),
(13, '13', 'Tlemcen', 'تلمسان', 650.00, '2-4 jours', 1),
(14, '14', 'Tiaret', 'تيارت', 650.00, '2-4 jours', 1),
(15, '15', 'Tizi Ouzou', 'تيزي وزو', 550.00, '1-3 jours', 1),
(16, '16', 'Alger', 'الجزائر', 400.00, '24-48 heures', 1),
(17, '17', 'Djelfa', 'الجلفة', 700.00, '2-4 jours', 1),
(18, '18', 'Jijel', 'جيجل', 650.00, '2-4 jours', 1),
(19, '19', 'Sétif', 'سطيف', 600.00, '1-3 jours', 1),
(20, '20', 'Saïda', 'سعيدة', 700.00, '2-4 jours', 1),
(21, '21', 'Skikda', 'سكيكدة', 650.00, '2-4 jours', 1),
(22, '22', 'Sidi Bel Abbès', 'سيدي بلعباس', 650.00, '2-4 jours', 1),
(23, '23', 'Annaba', 'عنابة', 650.00, '2-3 jours', 1),
(24, '24', 'Guelma', 'قالمة', 650.00, '2-4 jours', 1),
(25, '25', 'Constantine', 'قسنطينة', 600.00, '1-3 jours', 1),
(26, '26', 'Médéa', 'المدية', 550.00, '1-3 jours', 1),
(27, '27', 'Mostaganem', 'مستغانم', 650.00, '2-4 jours', 1),
(28, '28', 'M''Sila', 'المسيلة', 650.00, '2-4 jours', 1),
(29, '29', 'Mascara', 'معسكر', 650.00, '2-4 jours', 1),
(30, '30', 'Ouargla', 'ورقلة', 850.00, '3-5 jours', 1),
(31, '31', 'Oran', 'وهران', 550.00, '1-3 jours', 1),
(32, '32', 'El Bayadh', 'البيض', 800.00, '3-5 jours', 1),
(33, '33', 'Illizi', 'إليزي', 1200.00, '4-6 jours', 1),
(34, '34', 'Bordj Bou Arréridj', 'برج بوعريريج', 600.00, '1-3 jours', 1),
(35, '35', 'Boumerdès', 'بومرداس', 450.00, '1-2 jours', 1),
(36, '36', 'El Tarf', 'الطارف', 700.00, '2-4 jours', 1),
(37, '37', 'Tindouf', 'تندوف', 1200.00, '4-6 jours', 1),
(38, '38', 'Tissemsilt', 'تيسمسيلت', 650.00, '2-4 jours', 1),
(39, '39', 'El Oued', 'الوادي', 750.00, '2-4 jours', 1),
(40, '40', 'Khenchela', 'خنشلة', 700.00, '2-4 jours', 1),
(41, '41', 'Souk Ahras', 'سوق أهراس', 700.00, '2-4 jours', 1),
(42, '42', 'Tipaza', 'تيبازة', 450.00, '1-2 jours', 1),
(43, '43', 'Mila', 'ميلة', 650.00, '2-4 jours', 1),
(44, '44', 'Aïn Defla', 'عين الدفلى', 550.00, '1-3 jours', 1),
(45, '45', 'Naâma', 'النعامة', 800.00, '3-5 jours', 1),
(46, '46', 'Aïn Témouchent', 'عين تموشنت', 650.00, '2-4 jours', 1),
(47, '47', 'Ghardaïa', 'غرداية', 800.00, '2-4 jours', 1),
(48, '48', 'Relizane', 'غليزان', 650.00, '2-4 jours', 1),
(49, '49', 'Timimoun', 'تيميمون', 1100.00, '4-6 jours', 1),
(50, '50', 'Bordj Badji Mokhtar', 'برج باجي مختار', 1300.00, '5-7 jours', 1),
(51, '51', 'Ouled Djellal', 'أولاد جلال', 750.00, '2-4 jours', 1),
(52, '52', 'Béni Abbès', 'بني عباس', 1100.00, '4-6 jours', 1),
(53, '53', 'In Salah', 'عين صالح', 1100.00, '4-6 jours', 1),
(54, '54', 'In Guezzam', 'عين قزام', 1300.00, '5-7 jours', 1),
(55, '55', 'Touggourt', 'تقرت', 800.00, '3-5 jours', 1),
(56, '56', 'Djanet', 'جانت', 1300.00, '5-7 jours', 1),
(57, '57', 'El M''Ghair', 'المغير', 800.00, '3-5 jours', 1),
(58, '58', 'El Meniaa', 'المنيعة', 900.00, '3-5 jours', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 3. CATEGORIES
INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `image_url`, `is_active`) VALUES
(1, 'Soins du Visage', 'soins-du-visage', 'Nettoyants, lotions, exfoliants et soins quotidiens pour un visage radieux.', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80', 1),
(2, 'Sérums & Huiles', 'serums-et-huiles', 'Élixirs botaniques concentrés en principes actifs revitalisants.', 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80', 1),
(3, 'Crèmes & Hydratation', 'cremes-et-hydratation', 'Crèmes nourrissantes et émulsions légères pour sublimer l''élasticité.', 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80', 1),
(4, 'Soins du Corps', 'soins-du-corps', 'Gommages sensoriels, beurres onctueux et huiles satinées pour le corps.', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80', 1),
(5, 'Parfums & Brumes', 'parfums-et-brumes', 'Brumes florales délicates et fragrances exclusives aux notes envoûtantes.', 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80', 1),
(6, 'Coffrets Cadeaux', 'coffrets-cadeaux', 'Sélections raffinées emballées dans un écrin élégant prêt à offrir.', 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 4. PRODUCTS
INSERT INTO `products` (`id`, `category_id`, `name`, `slug`, `description`, `short_description`, `price`, `discount_price`, `cost_price`, `stock_quantity`, `sku`, `is_active`, `is_featured`) VALUES
(1, 2, 'Élixir Botanique Rose Musquée & Vitamine C', 'elixir-botanique-rose-musquee', 'Ce sérum ultra-concentré illumine instantanément le teint, estompe les taches pigmentaires et restaure le film hydrolipidique de la peau grâce à une synergie de rose musquée bio et de vitamine C stabilisée. Texture soyeuse à pénétration rapide sans fini gras.', 'Sérum éclat illuminateur et régénérant anti-âge.', 3900.00, 3400.00, 1800.00, 45, 'BYD-SRM-001', 1, 1),

(2, 3, 'Crème Velours Hydratation Profonde 24H', 'creme-velours-hydratation-profonde', 'Enrichie en acide hyaluronique multi-moléculaire et en beurre de karité précieux, cette crème réconforte les peaux assoiffées en procurant une sensation de douceur immédiate qui dure toute la journée.', 'Soin nourrissant réconfortant à l''acide hyaluronique pur.', 4200.00, NULL, 2000.00, 30, 'BYD-CRM-002', 1, 1),

(3, 1, 'Mousse Nettoyante Florale Pivoine & Camomille', 'mousse-nettoyante-florale', 'Une mousse aérienne et ultra-délicate qui démaquille et élimine les impuretés en douceur tout en respectant l''équilibre cutané. Laisse la peau fraîche, apaisée et délicatement parfumée.', 'Mousse nettoyante douce certifiée sans sulfates.', 2400.00, 1990.00, 1100.00, 50, 'BYD-CLN-003', 1, 1),

(4, 2, 'Huile Miraculeuse Nuit Réparatrice', 'huile-miraculeuse-nuit', 'Traitement nocturne aux huiles végétales nobles (argan, jojoba et néroli). Agit pendant le sommeil pour booster le renouvellement cellulaire et offrir au réveil un teint repulpé et défatigué.', 'Huile de nuit revitalisante aux 7 actifs botaniques.', 4800.00, 4200.00, 2300.00, 25, 'BYD-OIL-004', 1, 1),

(5, 1, 'Lotion Tonique Équilibrante Eau de Rose Bio', 'lotion-tonique-rose-bio', 'Distillée à partir de pétales de roses damascena cueillies à l''aube, cette lotion affine le grain de peau, resserre les pores et prépare l''épiderme à recevoir ses soins quotidiens.', 'Tonique clarifiant et tonifiant naturel.', 2100.00, NULL, 950.00, 60, 'BYD-TON-005', 1, 0),

(6, 4, 'Baume Corporel Satiné Fleur d''Oranger & Amande', 'baume-corporel-satine', 'Texture fouettée fondante qui enveloppe le corps d''un voile protecteur et soyeux. Parfum envoûtant de fleur d''oranger ensoleillée.', 'Soin corps ultra-riche nourrissant et lissant.', 3200.00, 2800.00, 1500.00, 40, 'BYD-BDY-006', 1, 1),

(7, 5, 'Brume Parfumée Cheveux & Corps Pêche Blanche', 'brume-parfumee-peche-blanche', 'Une brume rafraîchissante légère enrichie en provitamine B5 pour parfumer subtilement la chevelure et la peau sans les dessécher.', 'Brume aérienne rafraîchissante longue tenue.', 2600.00, NULL, 1200.00, 35, 'BYD-BRM-007', 1, 0),

(8, 6, 'Coffret Rituel Éclat & Sérénité Prestige', 'coffret-rituel-eclat-serenite', 'Le cadeau idéal : regroupe le Sérum Botanique, la Crème Velours et un rouleau de quartz rose véritable, présentés dans une boîte de luxe BIYODO aux finitions dorées.', 'Coffret 3 essentiels beauté avec rouleau de quartz.', 8900.00, 7800.00, 4200.00, 15, 'BYD-BOX-008', 1, 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 5. PRODUCT IMAGES
INSERT INTO `product_images` (`product_id`, `image_url`, `is_primary`, `display_order`) VALUES
(1, 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80', 1, 0),
(1, 'https://images.unsplash.com/photo-1608248597359-253805b54e8c?auto=format&fit=crop&w=800&q=80', 0, 1),
(2, 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80', 1, 0),
(2, 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80', 0, 1),
(3, 'https://images.unsplash.com/photo-1556228722-d0b74051bf3d?auto=format&fit=crop&w=800&q=80', 1, 0),
(4, 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=800&q=80', 1, 0),
(5, 'https://images.unsplash.com/photo-1563178406-4cdc2923acbc?auto=format&fit=crop&w=800&q=80', 1, 0),
(6, 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80', 1, 0),
(7, 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80', 1, 0),
(8, 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80', 1, 0);

-- 6. COUPONS
INSERT INTO `coupons` (`id`, `code`, `discount_type`, `discount_value`, `min_order_amount`, `max_uses`, `current_uses`, `is_active`, `expires_at`) VALUES
(1, 'BIYODO10', 'percentage', 10.00, 3000.00, 500, 0, 1, DATE_ADD(NOW(), INTERVAL 1 YEAR)),
(2, 'BEAUTY500', 'fixed', 500.00, 5000.00, 200, 0, 1, DATE_ADD(NOW(), INTERVAL 1 YEAR))
ON DUPLICATE KEY UPDATE `code` = VALUES(`code`);

-- 7. INITIAL INVENTORY MOVEMENTS (record starting stock)
INSERT INTO `inventory_movements` (`product_id`, `admin_id`, `movement_type`, `quantity`, `previous_stock`, `new_stock`, `reason`) VALUES
(1, 1, 'in', 45, 0, 45, 'Stock initial de lancement'),
(2, 1, 'in', 30, 0, 30, 'Stock initial de lancement'),
(3, 1, 'in', 50, 0, 50, 'Stock initial de lancement'),
(4, 1, 'in', 25, 0, 25, 'Stock initial de lancement'),
(5, 1, 'in', 60, 0, 60, 'Stock initial de lancement'),
(6, 1, 'in', 40, 0, 40, 'Stock initial de lancement'),
(7, 1, 'in', 35, 0, 35, 'Stock initial de lancement'),
(8, 1, 'in', 15, 0, 15, 'Stock initial de lancement');
