
            // DOM-XSS that only Fuzzer can find
            function vulnerable_fuzzer(){
                document.write(decodeURIComponent(location.search.substring(1)));
            }

            // DOM-XSS that only DSE can find
            function vulnerable_dse(){
                document.write(decodeURIComponent(location.search.substring(1)));
            }
            
            if (location.search.includes('mustcontainthisstring')){
                vulnerable_dse();
            }


            // DOM-XSS that even Passive can find
            function vulnerable_passive(){
                eval(decodeURIComponent(location.search.substring(1)));
            }
            vulnerable_passive(); // Called regardless during page loading

        