INSERT INTO CIS2.FORM_CUIIO 
(
         CUIIO, 
         CUIIO_VERS,
         FORM,
         FORM_VERS,
         STATUT
)



SELECT  L.CUIIO AS CUIIO, 
         1069 CUIIO_VERS,
         45 FORM,
         1004 FORM_VERS,
         '1' STATUT 

    FROM VW_43_2015 L LEFT JOIN VW_45_1069 R ON R.CUIIO = L.CUIIO 
    
    
            WHERE 
            R.CUIIO IS NULL;
            
            
            
  SELECT L.CUIIO
          

    FROM VW_43_2015 L LEFT JOIN VW_45_1069 R ON R.CUIIO = L.CUIIO 
    
    
            WHERE 
            R.CUIIO IS NULL;
        