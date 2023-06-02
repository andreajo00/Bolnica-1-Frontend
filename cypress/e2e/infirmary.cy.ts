/// <reference types="cypress" />

describe("Infirmary workflow", ()=>{
    
    it("Nurse should schedule an appointment for a patient and set the status to waiting",()=>{
        cy.login("lisa.jones","password","/nurse-workspace")
        cy.visit("/nurse-schedule-appointment")
        cy.get("[data-cy='doctorSelect']").click()
        cy.get("[ng-reflect-ng-item-label='Jane Smith']").click({force:true})
        cy.get("[data-cy='pretraziButton']").click()
        cy.get("[data-date='1684776600000']").scrollIntoView().click({force:true})
        cy.get("[data-cy='razlog']").select('Pregled')
        cy.get("[data-cy='patient']").click()
        cy.get("[ng-reflect-ng-item-label='Adam Lee']").click({force:true})
        cy.get("[data-cy='dodajBtn']").click()
        cy.visit("/nurse-workspace")
        cy.get("[data-cy='doctorSelect']").click()
        cy.get("[ng-reflect-ng-item-label='Jane Smith']").click({force:true})
        cy.get("[data-cy='pretraziBtn']").click()
        cy.get("[data-cy='selectStatus']").last().select('CEKA')
        cy.get("[data-cy='azurirajBtn']").last().click()
    })

    it("Doctor should schedule an appointment at the cardiologist",()=>{
        cy.login("jane.smith","password","/doctor-workspace")
        cy.visit("/doctor-workspace")
        cy.contains("Pregled").last().click()
        cy.get("[data-cy='btnUput']").click()
        cy.get("[data-cy='infirmary-tab']").click()
        cy.get("[data-cy='diagnosis']").type("A15.3 - Tuberkuloza pluća, potvrđena neoznačenim metodama (Tuberculosis pulmonum, methodis non specificatis confirmata)",{force:true})
        cy.get("[data-cy='KomentarStacionar']").type("Pregled",{force:true})
        cy.get("[data-cy='OdeljenjeStacionar']").select("Cardiology").invoke("val").should("eq","Cardiology")
        cy.get("[data-cy='btnUstanove']").click()
        cy.get("[data-cy='cbHospitalStacionar']").click()
        cy.get("[data-cy='btnDodajStacionar']").click()
        cy.on('window:confirm', (message) => {
            expect(message).to.equal('Da li ste sigurni da želite da napravite uput?');
          });
        cy.go('back')
    })    

    it("Nurse should admit the patient to the infirmary",()=>{
        cy.login("lisa.jones","password","/nurse-workspace")
        cy.visit("/nurse-infirmary-schedule-admission")
        cy.get("[data-cy='lbp']").type("P0004 - Adam (Lee)",{force:true})
        cy.get("[data-cy='pretrazi']").click()
        cy.get("[data-cy='sacuvaj']").last().click()
        cy.get("[data-cy='note']").type("Hitno!",{force:true})
        cy.get("[data-cy='button']").click()
        cy.visit("/nurse-infirmary-search-admission")
        cy.get("[data-cy='lbp']").type("P0004",{force:true})
        cy.contains("ZAKAZAN").should("be.visible")
        cy.visit("/nurse-infirmary-scheduled-patients")
        cy.get("[data-cy='lbp']").type("P0004",{force:true})
        cy.get("[data-cy='prijem']").last().click()
        cy.url().should('eq', 'http://localhost:4200/nurse-infirmary-patient-admission')
        cy.get("[data-cy='odabirSobe']").last().click()
        cy.get("[data-cy='doctorSelect']").scrollIntoView().type("Jane")
        cy.contains("Jane Smith").click()
        cy.get("[data-cy='note']").type("Hitno!",{force:true})
        cy.get("[data-cy='dischargeDateAndTime']").type("2023-05-25")
        cy.get("[data-cy='button']").click()
    })

    it("Nurse should check in on patient, register their visit and register their current state",()=>{
        cy.login("lisa.jones","password","/nurse-workspace")
        cy.visit("/nurse-infirmary-workspace")
        cy.get("[data-cy='lbp']").type("P0004 - Adam (Lee)",{force:true})
        cy.get("[data-cy='pretrazi']").click()
        cy.contains("Adam").click({force:true})
        cy.contains("Pacijent na stacionaru").should("be.visible")
        cy.get("[data-cy='registracijaPosete']").click()
        cy.url().should("eq", "http://localhost:4200/nurse-infirmary-register-visit/P0004")
        cy.get("[data-cy='visitorName']").type("Adam",{force:true})
        cy.get("[data-cy='visitorSurname']").type("Lee",{force:true})
        cy.get("[data-cy='visitorJmbg']").type("0303998000001",{force:true})
        cy.get("[data-cy='note']").type("Hitno!",{force:true})
        cy.get("[data-cy='button']").click()
        cy.contains("Uspesno registrovana poseta!").should("be.visible")
        cy.go('back')
        cy.url().should("eq", "http://localhost:4200/nurse-infirmary-workspace-one/P0004")
        cy.get("[data-cy='istorijaPosete']").click()
        cy.contains("Adam").should("be.visible")
        cy.visit("/nurse-infirmary-workspace-one/P0004")
        cy.url().should("eq", "http://localhost:4200/nurse-infirmary-workspace-one/P0004")
        cy.get("[data-cy='istorijaStanja']").click()
        cy.get("[data-cy='registrujStanje']").click()
        cy.url().should("eq", "http://localhost:4200/nurse-infirmary-register-state/P0004")
        cy.get("[data-cy='temperature']").type("27",{force:true})
        cy.get("[data-cy='systolicPressure']").type("145",{force:true})
        cy.get("[data-cy='diastolicPressure']").type("90",{force:true})
        cy.get("[data-cy='pulse']").type("80",{force:true})
        cy.get("[data-cy='therapy']").type("Odmaranje",{force:true})
        cy.get("[data-cy='description']").type("Lose!",{force:true})
        cy.get("[data-cy='timeExamState']").type("04:20")
        cy.get("[data-cy='button']").click()
    })

    it("Doctor should check in on patient, create a new lab referral, create a new health check and discharge the patient",()=>{
        cy.login("jane.smith","password","/doctor-workspace")
        cy.visit("/doctor-patients-infirmary")
        cy.get("[data-cy='lbp']").type("P0004 - Adam (Lee)",{force:true})
        cy.get("[data-cy='pretrazi']").click()
        cy.contains("Adam").click({force:true})
        cy.contains("Pacijent na stacionaru").should("be.visible")
        cy.get("[data-cy='uput']").click()
        cy.url().should("eq", "http://localhost:4200/doctor-infirmary-create-referral/P0004")
        cy.get("[data-cy='analysis']").select("Trigliceridi").invoke("val").should("eq","3")
        cy.get("[data-cy='dodajParametre']").click()
        cy.get("[data-cy='cbParametar']").click()
        cy.get("[data-cy='komentar']").type("Potrebna dodatna analiza.",{force:true})
        cy.get("[data-cy='dodaj']").click()
        cy.on('window:confirm', (message) => {
            expect(message).to.equal('Da li ste sigurni da želite da napravite uput?');
          });
        cy.contains("Uspesno dodat uput!").should("be.visible")
        cy.go('back')
        cy.get("[data-cy='zdravstveniIzvestaj']").click()
        cy.url().should("eq", "http://localhost:4200/doctor-infirmary-medical-record/P0004")
        cy.get("[data-cy='Tegobe']").type("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ligula diam, congue vitae tempor sed, congue et felis.",{force:true})
        cy.get("[data-cy='Bolest']").type("Vestibulum convallis efficitur accumsan.",{force:true})
        cy.get("[data-cy='LicnaAnamneza']").type("Donec mollis felis vitae mi fringilla..",{force:true})
        cy.get("[data-cy='PorodicnaAnamneza']").type("Curabitur id velit egestas, mollis dolor in.",{force:true})
        cy.get("[data-cy='MisljenjePacijenta']").type("Suspendisse dignissim mi et ex accumsan, quis vestibulum ex pretium.",{force:true})
        cy.get("[data-cy='ObjektivniNalaz']").type("Phasellus congue, quam a porta venenatis, velit odio pharetra ipsum.",{force:true})
        cy.get("[data-cy='btnDijagnoza']").click()
        cy.get("[data-cy='Sifra']").scrollIntoView().select("D50").invoke("val").should("eq","D50")
        cy.get("[data-cy='Rezultat']").select("OPORAVLJEN").invoke("val").should("eq","OPORAVLJEN")
        cy.get("[data-cy='OpisStanja']").type("Vestibulum dapibus mauris vitae elit pulvinar, vel commodo tortor finibus.",{force:true})
        cy.get("[data-cy='cbDijagnoza']").click({force:true})
        cy.get("[data-cy='PredlaganjeTerapije']").type("Cras dapibus, mauris vel efficitur scelerisque, metus nunc facilisis justo, non finibus ex augue id erat.",{force:true})
        cy.get("[data-cy='Savet']").type("Aenean malesuada nulla quis auctor gravida. Maecenas bibendum nisl mauris, id hendrerit lacus cursus vitae.",{force:true})
        cy.get("[data-cy='btnSacuvaj']").click({force:true})
        cy.get("[data-cy='btnOk']").click({force:true})
        cy.go('back')
        cy.get("[data-cy='istorijaStanja']").click()
        cy.url().should("eq", "http://localhost:4200/doctor-infirmary-state-history/P0004")
        cy.go('back')
        cy.get("[data-cy='otpusnaLista']").click()
        cy.url().should("eq", "http://localhost:4200/doctor-infirmary-discharge-list/P0004")
        cy.get("[data-cy='followingDiagnosis']").type("Lorem ipsum dolor sit amet, consectetur adipiscing elit.",{force:true})
        cy.get("[data-cy='anamnesis']").type("Vestibulum eget dolor iaculis dolor venenatis vestibulum quis vel velit.",{force:true})
        cy.get("[data-cy='analysis']").type("Suspendisse consectetur dolor eget risus tincidunt pulvinar.",{force:true})
        cy.get("[data-cy='courseOfDisease']").type("Fusce lacinia suscipit nisi, finibus ullamcorper nisl imperdiet ac.",{force:true})
        cy.get("[data-cy='summary']").type("Nulla lobortis iaculis sem, ut posuere magna rutrum eleifend. In tellus urna.",{force:true})
        cy.get("[data-cy='therapy']").type("Nullam sagittis nisl mauris.",{force:true})
        cy.get("[data-cy='button']").click()
        cy.contains("Uspesno kreirana otpusna lista!").should("be.visible")
        cy.go('back')
        cy.get("[data-cy='zdravstveniKarton']").click()
        cy.get("[data-cy='istorijaOtpusnihListi']").click()
        cy.get("[data-cy='dateOdOtpusna']").type("2023-05-22")
        cy.get("[data-cy='dateDoOtpusna']").type("2023-05-25")
        cy.get("[data-cy='pretraziOtpusna']").click()
        cy.get("[data-cy='sacuvajOtpusna']").last().click()
        cy.contains("Lorem ipsum").should("be.visible")
    })
})