const { z } = require('zod');

const adminLoginSchema = z.object({
  email: z.string().email('Adresse email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

const productSchema = z.object({
  category_id: z.coerce.number().int().positive('La catégorie est obligatoire'),
  name: z.string().min(2, 'Le nom du produit est trop court').max(200),
  description: z.string().optional().default(''),
  short_description: z.string().max(500).optional().default(''),
  price: z.coerce.number().positive('Le prix de vente doit être supérieur à 0'),
  discount_price: z.coerce.number().positive('Le prix remisé doit être positif').nullable().optional(),
  cost_price: z.coerce.number().min(0, 'Le coût d\'achat doit être >= 0').default(0),
  stock_quantity: z.coerce.number().int().min(0, 'Le stock ne peut pas être négatif').default(0),
  sku: z.string().optional().nullable(),
  is_active: z.coerce.boolean().default(true),
  is_featured: z.coerce.boolean().default(false),
  images: z.array(z.string().url()).optional(),
});

const categorySchema = z.object({
  name: z.string().min(2, 'Le nom de la catégorie est obligatoire').max(120),
  description: z.string().optional().nullable(),
  image_url: z.string().optional().nullable(),
  is_active: z.coerce.boolean().default(true),
});

const orderCreateSchema = z.object({
  full_name: z.string().min(2, 'Le nom complet est obligatoire').max(150),
  phone: z.string().min(8, 'Numéro de téléphone invalide').max(30),
  wilaya_id: z.coerce.number().int().positive('La wilaya de livraison est obligatoire'),
  commune: z.string().min(2, 'La commune est obligatoire').max(120),
  address: z.string().min(5, 'L\'adresse exacte est obligatoire'),
  order_notes: z.string().max(500).optional().nullable(),
  coupon_code: z.string().optional().nullable(),
  items: z.array(
    z.object({
      product_id: z.coerce.number().int().positive(),
      quantity: z.coerce.number().int().positive('La quantité doit être supérieure à 0'),
    })
  ).min(1, 'Votre panier est vide'),
});

const couponSchema = z.object({
  code: z.string().min(3, 'Le code promo doit comporter au moins 3 caractères').toUpperCase(),
  discount_type: z.enum(['percentage', 'fixed']),
  discount_value: z.coerce.number().positive('La valeur de réduction doit être positive'),
  min_order_amount: z.coerce.number().min(0).default(0),
  max_uses: z.coerce.number().int().positive().nullable().optional(),
  is_active: z.coerce.boolean().default(true),
  expires_at: z.string().optional().nullable(),
});

const inventoryAdjustSchema = z.object({
  product_id: z.coerce.number().int().positive('Produit invalide'),
  movement_type: z.enum(['in', 'out', 'adjustment']),
  quantity: z.coerce.number().int().positive('La quantité doit être un nombre positif'),
  reason: z.string().min(3, 'Le motif du mouvement est requis'),
});

const wilayaUpdateSchema = z.object({
  delivery_fee: z.coerce.number().min(0, 'Le tarif de livraison ne peut être négatif'),
  estimated_delivery_days: z.string().min(2, 'Délai de livraison requis'),
  is_active: z.coerce.boolean(),
});

module.exports = {
  adminLoginSchema,
  productSchema,
  categorySchema,
  orderCreateSchema,
  couponSchema,
  inventoryAdjustSchema,
  wilayaUpdateSchema,
};
