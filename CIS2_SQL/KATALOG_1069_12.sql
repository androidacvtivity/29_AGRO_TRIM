DECLARE -- ====================================================================

CURSOR C IS

SELECT  L.CUIIO AS CUIIO, 
        L.CUIIO_VERS,
        R.CFOJ

    FROM VW_43_2015 L LEFT  JOIN RENIM_AGR R ON R.CUIIO = L.CUIIO 
    
    
            WHERE 
            R.CUIIO IS NOT NULL
 
            
            --------------------------------
            ;

BEGIN -- ======================================================================
FOR CR IN C
LOOP
UPDATE CIS2.RENIM SET
--
--DENUMIRE = CR.DENUMIRE,  
--CUATM = CR.CUATM,
CFOJ = CR.CFOJ


WHERE
CUIIO = CR.CUIIO 
AND 
CUIIO_VERS =  CR.CUIIO_VERS; 
END LOOP;
END;

---------------------------


