select dropIfExists('VIEW', 'opportunity_characteristic', 'xm');

-- return rule

create or replace view xm.opportunity_characteristic as

select 
  charass_id as id,
  charass_target_id as opportunity,
  charass_char_id as characteristic,
  charass_value as value
from charass
where ( charass_target_type = 'OPP' );

-- insert rule

create or replace rule "_CREATE" as on insert to xm.opportunity_characteristic
  do instead

insert into charass (
  charass_id,
  charass_target_id,
  charass_target_type,
  charass_char_id,
  charass_value )
values (
  new.id,
  new.opportunity,
  'OPP',
  new.characteristic,
  new.value );

-- update rule

create or replace rule "_UPDATE" as on update to xm.opportunity_characteristic
  do instead

update charass set
  charass_char_id = new.characteristic,
  charass_value   = new.value
where ( charass_id = old.id );

-- delete rule

create or replace rule "_DELETE" as on delete to xm.opportunity_characteristic
  do instead

delete from charass
where ( charass_id = old.id );