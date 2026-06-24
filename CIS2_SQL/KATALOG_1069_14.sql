CREATE OR REPLACE FORCE VIEW USER_BANCU.VW_43_2015

AS
    SELECT FC.CUIIO,
           FC.CUIIO_VERS,
           FC.FORM,
           FC.FORM_VERS,
           FC.STATUT,
           r.denumire,
           r.cuatm,
           r.cfoj
      FROM (SELECT FC.CUIIO,
                   FC.CUIIO_VERS,
                   FC.FORM,
                   FC.FORM_VERS,
                   FC.STATUT
              FROM CIS2.FORM_CUIIO  FC
                   INNER JOIN (  SELECT CUIIO, MAX (CUIIO_VERS) CUIIO_VERS
                                   FROM CIS2.FORM_CUIIO
                                  WHERE FORM IN (43) AND CUIIO_VERS <= 2015
                               GROUP BY CUIIO) BB
                       ON (    BB.CUIIO = FC.CUIIO
                           AND BB.CUIIO_VERS = FC.CUIIO_VERS)
             WHERE     FC.FORM IN (43)
                   AND FC.STATUT <> '3'
                   AND FC.FORM_VERS = 2000) FC
                   
                   
                                    inner join cis2.renim r on r.cuiio = fc.cuiio and r.cuiio_vers = fc.cuiio_vers 