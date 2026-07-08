-- Enforce: store_products.sellingPrice PHẢI nằm trong khung [agentMinPrice, agentMaxPrice]
-- của sản phẩm. Đây là ràng buộc cross-table nên CHECK không làm được → dùng TRIGGER.
-- (Business rule cốt lõi: đại lý không được đặt giá ngoài khung Admin quy định.)

CREATE OR REPLACE FUNCTION enforce_store_product_price_band()
RETURNS TRIGGER AS $$
DECLARE
  v_min DECIMAL(15,2);
  v_max DECIMAL(15,2);
BEGIN
  SELECT "agentMinPrice", "agentMaxPrice"
    INTO v_min, v_max
    FROM "products"
   WHERE "id" = NEW."productId";

  IF v_min IS NULL THEN
    RAISE EXCEPTION 'Sản phẩm % không tồn tại', NEW."productId";
  END IF;

  IF NEW."sellingPrice" < v_min OR NEW."sellingPrice" > v_max THEN
    RAISE EXCEPTION 'Giá bán % ngoài khung cho phép [%, %]',
      NEW."sellingPrice", v_min, v_max
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_store_product_price_band ON "store_products";
CREATE TRIGGER trg_store_product_price_band
  BEFORE INSERT OR UPDATE OF "sellingPrice", "productId" ON "store_products"
  FOR EACH ROW
  EXECUTE FUNCTION enforce_store_product_price_band();
