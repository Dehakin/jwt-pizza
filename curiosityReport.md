HAR Files
* Stands for "HTML Archive" with the extension ".har".
* Essentially a lot of data of the JSON format that describes the information passed between a web client and a server.
* Can store sensitive information like authentication tokens and API keys! Need to be careful of who gets access to them!
* For example, the jwt of your super important pizzas and your inputted password can be found in a .har file you make (I was able to find them in one such .har file).
* Most browsers (e.g. Safari, Chrome, Firefox, Edge) have utilities to automatically create .har files based on your activity in the browser, though there are other 3rd-party apps that can do the same
* Contained information:
    * HTTP requests/responses
    * Status codes
    * Cookies/cached data
    * Various time measurements (when HTTP requests/responses were sent and received)
    * Site images
 

 


Sources:
https://blog.purestorage.com/purely-educational/har-files-questions-answered/
