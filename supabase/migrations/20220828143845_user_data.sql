CREATE TABLE "public"."user_data" (
    "id" uuid NOT NULL,
    "created_at" timestamp with time zone DEFAULT now(),
    "email" text NOT NULL,
    "stripe_customer_id" text,
    "tasks" json[] DEFAULT '[{"type": "task", "title": "Buy mom flowers", "priority": 2, "space": "hackerdash-123", "project": "svelte-app-1234", "tags": []}, "completed": false, "date": "2023-8-23"]',
);

ALTER TABLE "public"."user_data" ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX user_data_pkey ON public.user_data USING btree (id);

ALTER TABLE "public"."user_data" ADD CONSTRAINT "user_data_pkey" PRIMARY KEY USING INDEX "user_data_pkey";

ALTER TABLE "public"."user_data" ADD CONSTRAINT "user_data_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) NOT VALID;

ALTER TABLE "public"."user_data" VALIDATE CONSTRAINT "user_data_id_fkey";

-- Allow any authenticated user to insert new rows
CREATE POLICY allow_insert ON user_data FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated'
  OR auth.hasRole('admin')
  OR auth.hasRole('authenticator')
);

CREATE POLICY "user_data.allow_select_own_user_data" ON user_data FOR SELECT USING (auth.uid() = id);

CREATE POLICY "user_data.allow_update_own_profile" on user_data
  for update using (auth.uid() = id);


CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_data (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

-- Trigger the function every time a user is inserted
CREATE TRIGGER on_auth_user_inserted
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Trigger the function every time a row is inserted in user_data
CREATE TRIGGER on_user_data_insert_create_stripe_customer
AFTER INSERT ON public.user_data
FOR EACH ROW EXECUTE FUNCTION supabase_functions.http_request(
  'https://ncvoplbawcrefpsplcue.functions.supabase.co/create-stripe-customer', 'POST',
  '{"Content-type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jdm9wbGJhd2NyZWZwc3BsY3VlIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTAwOTU0MTksImV4cCI6MjAwNTY3MTQxOX0.oLJWKI79KQPVKLvk9jI_f7fwig4hruuedsJMC-7tlAo"}'
);
