// Växla mellan sidor när klickar på navigationslänkar
document.querySelectorAll(".nav-link").forEach(link => { //document.querySelectorAll()hämtar alla element i html som matchar ".nv-link",dvs alla inom <.nav-link>
//link är en variabel i forEach() som representerar varje enskild <a>-tagg.//for.Each(link => { ,Går igenom varje element i listan och kör koden i nästa rad
    link.addEventListener("click", function () { //när nån klickar på nåt i .nav-link så körs koden i nästa rad
        document.querySelectorAll(".page").forEach(page => page.classList.remove("active"));//tar brto active från alla så bara den klickade blir synlig i klassen page
        document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));//l är en variabel som representerar varje enskild länk
        //de två kod-raderna, första tar bort active från alla, och andra tar bort active från nav-länkar (bottenmarkören)


        //                   dataset.page är inlägg, hem och kontak.this.dataset.page hämtar värdet från data-page i den klickade länken.
        document.getElementById(this.dataset.page).classList.add("active");//Först nollställde vi allt i förra två rader sedan aktiverar vi den klickade och gör den synlig
        this.classList.add("active");//aktiverar bottenmarkören

        //om den klickade är posts hämtas inläggen
        if (this.dataset.page === "posts") {
            fetchPosts();
        }
    });
});

//hämtas online. API-endpoints är en URL som används för att kommunicera med ett API och hämta eller skicka data
const API_POSTS= "https://dummyjson.com/posts";
const API_USERS= "https://dummyjson.com/users";
const API_COMMENTS= "https://dummyjson.com/comments";

let postPage= 1; //variabeln sätts till 1 alltså hämtas första sidan av posts.2 för att hämta nästa sida osv(hämta fler)

// Hämta och visa inlägg med paginering.Hämtar och visar inlogg med .log()
async function fetchPosts() {
    console.log("Hämtar inlägg, sida:", postPage); //hämtar och visar texten plus sidnummer av inlägg

    try {               //väntar på att hämta data från API:t innan koden fortsätter till nästa rad
        const response = await fetch(`${API_POSTS}?limit=5&skip=${(postPage - 1) * 5}`);//API_POSTS → API:s URL för inlägg.limit=5 → Hämtar max 5 inlägg per sida.
        const data = await response.json();                    //skip=${(postPage - 1) * 5} → Hoppar över.om postpage=1 blir det 1-1*5=0 för att börja från rätt plats
//                  response omvandlas inte till json förän hämtningen är klar
        
        if (data.posts.length === 0) {//om inga fler inlägg finns så
            document.getElementById("load-more").style.display = "none"; // så dölj ladda fler-knappen
            return; //style.display är en CSS-egenskap. ="none" Döljer elementet. ="block" visar element
        }

        displayPosts(data.posts);
        postPage++; // Öka sidnumret för nästa hämtning
    } catch (error) {
        console.error("Fel vid hämtning av inlägg:", error);
        document.getElementById("post-list").innerHTML = "<p class='error'>Kunde inte ladda inlägg.</p>";
    }// innerHTML byter ändrar gamla skylttexten post-list med nya texten kunde inte etc och class=error för att css-styla texten 
}

// Visa inlägg i DOM
async function displayPosts(posts) {
    const postList=document.getElementById("post-list");//post-list är behållaren (en <div> i HTML) där de fem hämtade inläggen (posts) läggs till.
    //post-list hämtas från HTML och används för att lägga till inlägg i den.

    for (let post of posts) {//post utgör varje enskilt inlägg
        const user=await fetchUser(post.userId);// hämta info om den användare som skapade inlägget och lägg i user
        const comments=await fetchComments(post.id);// hämta kommentarer kopplade till det specifika inlägget och lägg i comments

        let postElement=document.createElement("div");//createElement skapar en html-div och fylls med innehåll innan den läggs på sidan
        postElement.classList.add("post");//lägger till klassen "post" på det skapade <div>-elementet.

// HTML-innehållet i postElemen genom template literals ``(kan ha radbrytningar utan \n).nyttigare version av strängar
//dynamiskt fylla inläggets info.h2 visar titeln på inlägget.Allt detta är js-genererat html.
//p visar själva texten i inlägget.
//p Lägger till användarens namn och sparar userId i data-userid
//p Tar en array av taggar och gör om den till en komma-separerad lista.
//p Visar antal gillningar, om det saknas sätts det till 0
//lägger till en rubrik med texten "Kommentarer:" i varje inlägg.
//ul Om det finns kommentarer, skapas en <li> för varje kommentar med text + användarnamn.Om det inte finns några, visas "Inga kommentarer".
//? sätts i slutet och är ja eller nej, eller kommer i av :
// || används i true eller false.  || = or
        postElement.innerHTML = ` 
            <h2>${post.title}</h2>
            <p>${post.body}</p>
            <p class="username" data-userid="${post.userId}">${user.username}</p>
            <p>Taggar: ${post.tags.join(", ")}</p>
            <p>Reaktioner: ${post.reactions.likes || 0}</p>
            <h3>Kommentarer:</h3>
            <ul>${comments.length ? comments.map(comment => `<li>${comment.body} - <strong>${comment.user.username}</strong></li>`).join("") : "<li>Inga kommentarer</li>"}</ul>
        `;
        postList.appendChild(postElement);//lägger till postElement i befintligt HTML-element
    }

    // Lägg till eventlyssnare på användarnamn
//lägger till en klickhändelse på alla .username-element, så att när en användares namn klickas, visas deras profil i pop-up
    document.querySelectorAll(".username").forEach(user => {
        user.addEventListener("click", function () {
            showUserProfile(this.dataset.userid);
        });
    });
}

// Hämta användare från API
async function fetchUser(userId) {
    try {
        const response=await fetch(`${API_USERS}/${userId}`); // delimiter som separerar delar av en URL
        return await response.json(); // konverterar svar till JSON
    } catch (error) {
        console.error("Fel vid hämtning av användare:", error);
        return { username: "Okänd" };
    }
}

// Hämta kommentarer och koppla dem till rätt inlägg
async function fetchComments(postId) {
    try {
        const response=await fetch(API_COMMENTS);
        const data=await response.json();
        return data.comments.filter(comment => comment.postId === postId);//Filtrerar kommentarer som bara hör till det specifika inlägget
    } catch (error) {
        console.error("Fel vid hämtning av kommentarer:", error);
        return [];
    }
}

// Visa användarprofil i modal
async function showUserProfile(userId) {
    const user = await fetchUser(userId);
    document.getElementById("user-name").textContent= user.firstName + " " + user.lastName;//Uppdaterar HTML med användarens namn, e-post och adress
    document.getElementById("user-email").textContent="E-post: " + user.email;
    document.getElementById("user-address").textContent=`Adress: ${user.address.city}, ${user.address.street}`;
    
    document.getElementById("user-modal").style.display="flex";//ändra i klassen modal(css) genom att ändra display från none (gömd) till "flex", så att den blir synlig på sidan
}

// Stäng modal vid klick på stäng-knappen
document.querySelector(".close").addEventListener("click", function () {
    document.getElementById("user-modal").style.display="none";
});

// Ladda fler inlägg vid klick på "Ladda fler"
//Hämtar elementet med id "load-more".Lägger till en klick-händelse på det.Anropar fetchPosts() när knappen klickas.
document.getElementById("load-more").addEventListener("click",fetchPosts);


// Validera kontaktformulär
//Hämtar formuläret med id="contact-form".Lägger till en input-händelse – körs varje gång användaren skriver i ett fält.
document.getElementById("contact-form").addEventListener("input", function () {
    let name=document.getElementById("name").value;//Texten från fältet med id="name"
    let email=document.getElementById("email").value;//Texten från id="email"
    let confirm=document.getElementById("confirm").checked;//Om checkboxen id="confirm" är markerad (true/false).


//Hämtar elementet med id="name-error".tillåtna är Bokstäver (a-z, A-Z, åäö, ÅÄÖ) och Mellanslag (\s)
//siffror och specialtecken (som inte finns med) är inte tillåtna.efter /^ börjar tillåtna tecken
//+ är Minst ett tecken krävs (av de tillåtna). $ är Slutet av strängen (inget annat får finnas efter)
    document.getElementById("name-error").textContent = /^[a-zA-ZåäöÅÄÖ\s]+$/.test(name) || name === "" ? "" : "Namnet får inte innehålla siffror.";
    

// kontrollerar om fältet e-post har ett värde och visar ett felmeddelande endast om användaren har börjat skriva men formatet är felaktigt.
//email.length > 0 → Kollar om något har skrivits.
//Regex (/\S+@\S+\.\S+/) → Kollar om det är en giltig e-post.
//Felmeddelande visas bara om e-posten är ogiltig.
// \S+ → Minst ett icke-blankt tecken före @
// @ → Måste finnas
// \S+ → Minst ett icke-blankt tecken efter @
// \. → Måste finnas en punkt
// \S+ → Minst ett icke-blankt tecken efter punkten
//test(email)? används för att kolla om email matchar regex-mönstret och returnerar true eller false. om e-postadressen är giltig (true), så sätts texten till "" (tomt, inget felmeddelande).annars "ogiltig"
//betyder att om email.length === 0 (fältet är tomt), så töms felmeddelandet ("").Varför?För att vi bara vill visa felet om användaren har börjat skriva, men inte om fältet är helt tomt.
    if (email.length > 0) {
        document.getElementById("email-error").textContent = /\S+@\S+\.\S+/.test(email) ? "" : "Ogiltig e-postadress.";
    } else {
        document.getElementById("email-error").textContent = "";
    }

//Om confirm är true (t.ex. en checkbox är markerad), sätts felmeddelandet till "" (inget fel).
//Om confirm är false (checkboxen är inte markerad), visas "Du måste bekräfta innan du
    document.getElementById("confirm-error").textContent = confirm ? "" : "Du måste bekräfta innan du skickar.";


//Knappen "send-btn" är inaktiverad (disabled = true) om något av name, email eller confirm saknas.
//Knappen blir aktiv (disabled = false) först när alla fält är ifyllda och bekräftelsen är markerad.
// ! betyder något annan än
    document.getElementById("send-btn").disabled= !(name && email && confirm);
});


// Hantera formulärskickning
//koden gör så att när formuläret med id "contact-form" skickas:
document.getElementById("contact-form").addEventListener("submit", function(event) {//"submit" är händelsen som triggas när användaren skickar formuläret.
    event.preventDefault(); // Förhindra att sidan laddas om.      ovan körs när händelsen inträffar.

    alert("Formuläret har skickats!");//skickar detta meddelande
    this.reset(); // Rensa alla fält i formuläret efter inskick
    document.getElementById("send-btn").disabled=true; // Inaktivera knappen igen efter inskick
});


//Vänta tills hela HTML-dokumentet är laddat och klart, innan fetchPosts() körs.
//"DOMContentLoaded" säkerställer att JavaScript körs efter att DOM-strukturen är redo, men innan bilder och CSS är helt laddade.
document.addEventListener("DOMContentLoaded",fetchPosts);
