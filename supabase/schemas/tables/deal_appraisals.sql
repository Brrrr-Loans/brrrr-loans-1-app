-- Table: public.deal_appraisals
CREATE TABLE public.deal_appraisals (
  id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  deal_id bigint NULL,
  appraisal_id bigint NULL,
  property_Id bigint NULL
);

alter table "public"."deal_appraisals" add constraint "deal_appraisals_deal_id_fkey" foreign key ("deal_id") references "public"."deal" ("id");
alter table "public"."deal_appraisals" add constraint "deal_appraisals_appraisal_id_fkey" foreign key ("appraisal_id") references "public"."appraisal" ("id");
alter table "public"."deal_appraisals" add constraint "deal_appraisals_property_id_fkey" foreign key ("property_Id") references "public"."property" ("id"); 