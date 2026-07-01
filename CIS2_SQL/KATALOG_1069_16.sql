DECLARE -- ====================================================================

CURSOR C IS



       SELECT  L.CUIIO,
               L.CUIIO_VERS,
               TRIM(R.CAEM2) AS CFOJ 
            
          
       FROM  VW_43_2015 L LEFT JOIN USER_BANCU.RENIMRR R ON R.CUIIO = L.CUIIO 
       
                    WHERE 
                    R.CUIIO IS NOT NULL;
  
 
            
            --------------------------------
      

BEGIN -- ======================================================================
FOR CR IN C
LOOP
UPDATE CIS2.RENIM SET
--
--DENUMIRE = CR.DENUMIRE,  
--CUATM = CR.CUATM,
--CFP = CR.CFP,
CFOJ = CR.CFOJ


WHERE
CUIIO = CR.CUIIO 
AND 
CUIIO_VERS =  CR.CUIIO_VERS; 
END LOOP;
END;

---------------------------