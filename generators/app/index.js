const chalk = require('chalk');
const packagejs = require('../../package.json');
const semver = require('semver');
const BaseGenerator = require('generator-jhipster/generators/generator-base');
const jhipsterConstants = require('generator-jhipster/generators/generator-constants');
const jhipsterUtils = require('generator-jhipster/generators/utils');
const _ = require('lodash');

module.exports = class extends BaseGenerator {
    get initializing() {
        return {
            init(args) {
                if (args === 'default') {
                    // do something when argument is 'default'
                }
            },
            readConfig() {
                this.jhipsterAppConfig = this.getJhipsterAppConfig();
                if (!this.jhipsterAppConfig) {
                    this.error('Can\'t read .yo-rc.json');
                }
            },
            displayLogo() {
                // it's here to show that you can use functions from generator-jhipster
                // this function is in: generator-jhipster/generators/generator-base.js
                this.printJHipsterLogo();

                // Have Yeoman greet the user.
                this.log(`\nWelcome to the ${chalk.bold.yellow('JHipster stripe-payment')} generator! ${chalk.yellow(`v${packagejs.version}\n`)}`);
            },
            checkJhipster() {
                const currentJhipsterVersion = this.jhipsterAppConfig.jhipsterVersion;
                const minimumJhipsterVersion = packagejs.dependencies['generator-jhipster'];
                if (!semver.satisfies(currentJhipsterVersion, minimumJhipsterVersion)) {
                    this.warning(`\nYour generated project used an old JHipster version (${currentJhipsterVersion})... you need at least (${minimumJhipsterVersion})\n`);
                }
            }
        };
    }

    prompting() {
        const prompts = [{
                type: 'input',
                name: 'pubStripeKey',
                message: 'Please enter your publishable stripe key',
                default: 'pk_live_xxxxxxxxxxxxxxxxxxxxxxxx'
            },
            {
                type: 'input',
                name: 'priStripeKey',
                message: 'Please enter your secret stripe key',
                default: 'sk_live_xxxxxxxxxxxxxxxxxxxxxxxx'
            }
        ];

        const done = this.async();
        this.prompt(prompts).then((props) => {
            this.props = props;
            // To access props later use this.props.someOption;
            done();
        });
    }

    writing() {
        if (this.jhipsterAppConfig.buildTool === 'maven' && (this.jhipsterAppConfig.clientFramework === 'angularX' || this.jhipsterAppConfig.clientFramework === 'angular2')) {
            // function to use directly template
            this.template = function(source, destination) {
                this.fs.copyTpl(
                    this.templatePath(source),
                    this.destinationPath(destination),
                    this
                );
            };
            var fs = require('fs');

            // read config from .yo-rc.json
            this.baseName = this.jhipsterAppConfig.baseName;
            this.packageName = this.jhipsterAppConfig.packageName;
            this.packageFolder = this.jhipsterAppConfig.packageFolder;
            this.clientFramework = this.jhipsterAppConfig.clientFramework;
            this.clientPackageManager = this.jhipsterAppConfig.clientPackageManager;
            this.buildTool = this.jhipsterAppConfig.buildTool;

            // use function in generator-base.js from generator-jhipster
            this.angularAppName = this.getAngularAppName();

            // use constants from generator-constants.js
            const javaDir = `${jhipsterConstants.SERVER_MAIN_SRC_DIR + this.packageFolder}/`;
            const javaTestDir = `${jhipsterConstants.SERVER_TEST_SRC_DIR + this.packageFolder}/`;
            const resourceDir = jhipsterConstants.SERVER_MAIN_RES_DIR;
            const webappDir = jhipsterConstants.CLIENT_MAIN_SRC_DIR;

            // variable from questions
            this.pubStripeKey = this.props.pubStripeKey;
            this.priStripeKey = this.props.priStripeKey;

            this.template('payment.jh', 'payment.jh');

        } else {
            this.warning(`\n Your JHipster configuration is not supported yet ! :( Please use Maven and AngularX...`);
            console.log(this.jhipsterAppConfig.clientFramework);
            console.log(this.jhipsterAppConfig.buildTool);
        }
    }

    install() {
        if (this.jhipsterAppConfig.buildTool === 'maven' && (this.jhipsterAppConfig.clientFramework === 'angularX' || this.jhipsterAppConfig.clientFramework === 'angular2')) {
            var fs = require('fs');
            // read config from .yo-rc.json
            this.baseName = this.jhipsterAppConfig.baseName;
            this.packageName = this.jhipsterAppConfig.packageName;
            this.packageFolder = this.jhipsterAppConfig.packageFolder;
            this.clientFramework = this.jhipsterAppConfig.clientFramework;
            this.clientPackageManager = this.jhipsterAppConfig.clientPackageManager;
            this.buildTool = this.jhipsterAppConfig.buildTool;

            // use function in generator-base.js from generator-jhipster
            this.angularAppName = this.getAngularAppName();

            // use constants from generator-constants.js
            const javaDir = `${jhipsterConstants.SERVER_MAIN_SRC_DIR + this.packageFolder}/`;
            const javaTestDir = `${jhipsterConstants.SERVER_TEST_SRC_DIR + this.packageFolder}/`;
            const resourceDir = jhipsterConstants.SERVER_MAIN_RES_DIR;
            const webappDir = jhipsterConstants.CLIENT_MAIN_SRC_DIR;

            // variable from questions
            this.pubStripeKey = this.props.pubStripeKey;
            this.priStripeKey = this.props.priStripeKey
            //******************************************
            //
            // Adding a new payment entity
            //
            //******************************************

            var shell = require('shelljs');
            //adding ngx-stripe dependency
            if (shell.exec('npm install ngx-stripe').code !== 0) {
                shell.echo('Error: ngx-stripe installation failed');
                shell.exit(1);
            }
            //Generating payment entity
            if (shell.exec('jhipster import-jdl payment.jh').code !== 0) {
                shell.echo('Error: jdl importation failed');
                shell.exit(1);
            }

            //adding the front part
            this.template('payments/index.ts', `${webappDir}app/payments/index.ts`);
            this.template('payments/payments.component.ts', `${webappDir}app/payments/payments.component.ts`);
            this.template('payments/payments.component.html', `${webappDir}app/payments/payments.component.html`);
            this.template('payments/payments.module.ts', `${webappDir}app/payments/payments.module.ts`);
            this.template('payments/payments.route.ts', `${webappDir}app/payments/payments.route.ts`);

            if (this.jhipsterAppConfig.useSass) {
                this.template('payments/payments.scss', `${webappDir}app/payments/payments.scss`);
            } else {
                this.template('payments/payments.scss', `${webappDir}app/payments/payments.css`);
            }

            //adding payments.json file in all languages
            if (this.jhipsterAppConfig.enableTranslation) {
                var pathLangs = `${webappDir}i18n`;
                var allLangs = fs.readdirSync(pathLangs);
                for (var i = 0; i < allLangs.length; i++) {
                    this.template('payments.json', `${webappDir}/i18n/${allLangs[i]}/payments.json`);
                }
            }
            //changing pom.xml (adding stripe dependency)

            // Maven + AngularX
            if (this.buildTool === 'maven') {
                jhipsterUtils.rewriteFile({
                    file: 'pom.xml',
                    needle: 'jhipster-needle-maven-add-dependency',
                    splicable: [`<dependency>
                <groupId>com.stripe</groupId>
                <artifactId>stripe-java</artifactId>
                <version>7.0.0</version>
            </dependency>`]
                }, this);

            }
            if (this.buildTool === 'gradle') {
                //Add stripe dependency for stripe here
                //compile "com.stripe:stripe-java:7.21.0"
            }

            //changing app.module.ts (adding stripe and form)

            var appname = this.getAngularXAppName();
            //var appname = appnamenomaj.charAt(0).toUpperCase() + appnamenomaj.substring(1);

            jhipsterUtils.rewriteFile({
                file: `${webappDir}app/app.module.ts`,
                needle: 'jhipster-needle-angular-add-module-import',
                splicable: [`import { NgxStripeModule } from 'ngx-stripe';`]
            }, this);

            jhipsterUtils.rewriteFile({
                file: `${webappDir}app/app.module.ts`,
                needle: 'jhipster-needle-angular-add-module',
                splicable: [`NgxStripeModule.forRoot('${this.pubStripeKey}'),`]
            }, this);

            this.addAngularModule(
                _.upperFirst(this.getAngularAppName()),
                'Payments',
                'payments',
                'payments',
                this.jhipsterAppConfig.enableTranslation,
                'angularX');

            // changing app-routing.module.ts (import FormsModule and ReactiveFormsModule)
            jhipsterUtils.rewriteFile({
                file: `${webappDir}app/app-routing.module.ts`,
                needle: './layouts',
                splicable: [`import { FormsModule, ReactiveFormsModule } from '@angular/forms';`]
            }, this);

            jhipsterUtils.rewriteFile({
                file: `${webappDir}app/app-routing.module.ts`,
                needle: 'RouterModule.forRoot',
                splicable: [`FormsModule, ReactiveFormsModule,`]
            }, this);

            // updating payments.module.ts to add project name

            jhipsterUtils.rewriteFile({
                file: `${webappDir}app/payments/payments.module.ts`,
                needle: 'import { PAYMENTS_ROUTE, PaymentsComponent } from \'./\';',
                splicable: [`import { ${appname}SharedModule } from \'app/shared\';`]
            }, this);

            jhipsterUtils.rewriteFile({
                file: `${webappDir}app/payments/payments.module.ts`,
                needle: 'declarations: [PaymentsComponent],',
                splicable: [`imports: [${appname}SharedModule, RouterModule.forChild([PAYMENTS_ROUTE]), FormsModule, ReactiveFormsModule],`]
            }, this);

            var appnamenomaj = this.angularAppName;
            var angularappname = appnamenomaj.charAt(0).toUpperCase() + appnamenomaj.substring(1);

            jhipsterUtils.rewriteFile({
                file: `${webappDir}app/payments/payments.module.ts`,
                needle: '// JHipster Stripe Module will add new line here',
                splicable: [`export class ${angularappname}PaymentsModule { }`]
            }, this);

            // Adding Payment front-end page in the navbar (html)

            jhipsterUtils.rewriteFile({
                file: `${webappDir}app/layouts/navbar/navbar.component.html`,
                needle: '<!-- jhipster-needle-add-element-to-menu - JHipster will add new menu items here -->',
                splicable: [`<li class="nav-item" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
                <a class="nav-link" routerLink="/payments" (click)="collapseNavbar()">
                    <span>
                        <fa-icon icon="credit-card"></fa-icon>
                        <span>Payment</span>
                    </span>
                </a>
            </li>`]
            }, this);

            // Adding a new service in the back-end
            jhipsterUtils.rewriteFile({
                file: `${javaDir}web/rest/PaymentResource.java`,
                needle: 'import javax.validation.Valid;',
                splicable: [`import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.stripe.Stripe;
import java.util.HashMap;
import java.util.Map;
import com.stripe.exception.AuthenticationException;
import com.stripe.exception.CardException;
import com.stripe.exception.InvalidRequestException;
import com.stripe.exception.RateLimitException;
import com.stripe.exception.StripeException;
import com.stripe.model.Charge;
import io.github.jhipster.web.util.ResponseUtil;`]
            }, this);

            jhipsterUtils.rewriteFile({
                file: `${javaDir}web/rest/PaymentResource.java`,
                needle: 'private final PaymentRepository paymentRepository;',
                splicable: [`/**
  	 * PUT /payments/currentuser : Updates an existing payment.
  	 *
  	 * @param payment the payment to create with the current connected user
  	 * @return the ResponseEntity with status 200 (OK) and with body the updated
  	 *         payment, or with status 400 (Bad Request) if the payment is not
  	 *         valid, or with status 500 (Internal Server Error) if the payment
  	 *         couldn't be updated
  	 * @throws URISyntaxException if the Location URI syntax is incorrect
  	 */
  	@PutMapping("/payments/currentuser")
  	public ResponseEntity<Payment> createPaymentCurrentUser(@Valid @RequestBody Payment payment)
  			throws URISyntaxException {
  		log.debug("REST request to update Payment : {}", payment);
  		ResponseEntity<Payment> p;
  		if (payment.getId() == null) {
  			throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
  		}

  		// Set your secret key: remember to change this to your live secret key in
  		// production
  		// See your keys here: https://dashboard.stripe.com/account/apikeys
  		Stripe.apiKey = "${this.priStripeKey}";
  		// Token is created using Checkout or Elements!
  		// Get the payment token ID submitted by the form:
  		// String token = request.getParameter("stripeToken");
  		Map<String, Object> params = new HashMap<>();
  		params.put("amount", payment.getAmount());
  		params.put("currency", payment.getCurrency());
  		params.put("description", payment.getDescription());
  		params.put("source", payment.getToken());
  		params.put("capture", payment.isCapture());
  		try {
  			Charge charge = Charge.create(params);
  			// System.out.println(charge);
        Payment result = paymentRepository.save(payment);
  			p = ResponseEntity.ok().headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, payment.getId().toString()))
  					.body(result);
        result.setReceipt(charge.toJson());
        this.updatePayment(result);
  		} catch (CardException e) {
  			// Since it's a decline, CardException will be caught
  			System.out.println("Status is: " + e.getCode());
  			System.out.println("Message is: " + e.getMessage());
  			throw new BadRequestAlertException("CardException", ENTITY_NAME, "");
  		} catch (RateLimitException e) {
  			// Too many requests made to the API too quickly
  			throw new BadRequestAlertException("RateLimitException", ENTITY_NAME,
  					"Too many requests made to the API too quickly");
  		} catch (InvalidRequestException e) {
  			// Invalid parameters were supplied to Stripe's API
  			throw new BadRequestAlertException("InvalidRequestException", ENTITY_NAME,
  					"Invalid parameters were supplied to Stripe's API");
  		} catch (AuthenticationException e) {
  			// Authentication with Stripe's API failed
  			// (maybe you changed API keys recently)
  			throw new BadRequestAlertException("AuthenticationException", ENTITY_NAME,
  					"Authentication with Stripe's API failed, maybe you changed API keys recently");
  		} catch (StripeException e) {
  			// Display a very generic error to the user, and maybe send
  			// yourself an email
  			throw new BadRequestAlertException("An error occured", ENTITY_NAME, "Error");
  		} catch (Exception e) {
  			// Something else happened, completely unrelated to Stripe
  			throw new BadRequestAlertException("An error occured", ENTITY_NAME, "Error");
  		}
  		return p;
  	}`]
            }, this);

            // updating entities payment service (payment.service.ts)
            jhipsterUtils.rewriteFile({
                file: `${webappDir}app/entities/payment/payment.service.ts`,
                needle: 'public resourceUrl = SERVER_API_URL + \'api/payments\';',
                splicable: [`public resourceUrlCreatePaymentCurrentUser = SERVER_API_URL + 'api/payments/currentuser';`]
            }, this);

            jhipsterUtils.rewriteFile({
                file: `${webappDir}app/entities/payment/payment.service.ts`,
                needle: 'create(payment: IPayment): Observable<EntityResponseType> {',
                splicable: [`createPaymentCurrentUser(payment: IPayment): Observable<EntityResponseType> {
const copy = this.convertDateFromClient(payment);
return this.http
.put<IPayment>(this.resourceUrlCreatePaymentCurrentUser, copy, { observe: 'response' })
.pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
}`]
            }, this);
            // Adding Payment front-end page in the navbar (fa-icon)
            jhipsterUtils.rewriteFile({
                file: `${webappDir}app/vendor.ts`,
                needle: 'jhipster-needle-add-element-to-vendor - JHipster will add new menu items here',
                splicable: [`library.add(faCreditCard);`]
            }, this);

            jhipsterUtils.rewriteFile({
                file: `${webappDir}app/vendor.ts`,
                needle: 'faTasks,',
                splicable: [`faCreditCard,`]
            }, this);



        } else {
            this.warning(`\n Your JHipster configuration is not supported yet ! :( Please use Maven and AngularX...`);
        }
        let logMsg =
            `To install your dependencies manually, run: ${chalk.yellow.bold(`${this.clientPackageManager} install`)}`;

        if (this.clientFramework === 'angular1') {
            logMsg =
                `To install your dependencies manually, run: ${chalk.yellow.bold(`${this.clientPackageManager} install & bower install`)}`;
        }
        const injectDependenciesAndConstants = (err) => {
            if (err) {
                this.warning('Install of dependencies failed!');
                this.log(logMsg);
            } else if (this.clientFramework === 'angular1') {
                this.spawnCommand('gulp', ['install']);
            }
        };
        const installConfig = {
            bower: this.clientFramework === 'angular1',
            npm: this.clientPackageManager !== 'yarn',
            yarn: this.clientPackageManager === 'yarn',
            callback: injectDependenciesAndConstants
        };
        if (this.options['skip-install']) {
            this.log(logMsg);
        } else {
            this.installDependencies(installConfig);
        }
    }

    end() {
        const webappDir = jhipsterConstants.CLIENT_MAIN_SRC_DIR;
        var fs = require('fs');
        if (!this.jhipsterAppConfig.useSass) {
            var paymentRess = fs.readFileSync(`${webappDir}app/payments/payments.component.ts`);
            var res = paymentRess.toString().replace('styleUrls: [\'payments.scss\']', 'styleUrls: [\'payments.css\']');
            fs.writeFileSync(`${webappDir}app/payments/payments.component.ts`, res);
        }
        if (!this.jhipsterAppConfig.enableTranslation) {
            var paymentRess = fs.readFileSync(`${webappDir}app/payments/payments.route.ts`);
            var res = paymentRess.toString().replace('pageTitle: \'localversionApp.payments.title\'', 'pageTitle: \'Payment\'');
            fs.writeFileSync(`${webappDir}app/payments/payments.route.ts`, res);
        }
        this.rebuildClient();
        this.log('End of stripe-payment generator');
    }
};
