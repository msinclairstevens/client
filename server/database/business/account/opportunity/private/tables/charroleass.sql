-- remove old trigger if any

select dropIfExists('TRIGGER', 'opportunity_sync_charroleass_to_char', 'private');

-- populate current data
insert into private.charroleass (charroleass_char_id, charroleass_charrole_id)
select * from (
select
  char_id,
  charrole_id
from public.char, private.charrole
  join private.datatype on charrole_datatype_id=datatype_id
where ( char_opportunity )
 and (datatype_name ='Opportunity')
 ) data
where not exists (
  select * 
  from private.charroleass
  where (charroleass_char_id=char_id)
   and (charroleass_charrole_id=charrole_id)
);

-- create trigger

create trigger opportunity_sync_charroleass_to_char after insert or update or delete on private.charroleass for each row execute procedure private.opportunity_sync_charroleass_to_char();

