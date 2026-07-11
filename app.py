from flask import Flask, render_template, request, redirect, url_for, flash, session
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from translations import t, bilingual

app.jinja_env.globals['t'] = t
app.jinja_env.globals['bilingual'] = bilingual

UNIT_TO_CRORE = {"Crore": 1, "Arba": 100, "Kharba": 10000}

def to_crore(value, unit):
    if value is None:
        return 0
    return value * UNIT_TO_CRORE.get(unit, 1)
app = Flask(__name__)

# Configuration
app.secret_key = "budget_secret_key_2026"
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:@localhost/budget_tracking'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Custom filter for Nepali number formatting
@app.template_filter('format_number')
def format_number(value, unit=True):
    if value is None:
        return "0"
    
    if isinstance(value, str):
        value = float(value)
    
    if value >= 10000000000:   # 100 Kharba
        return f"{value/10000000000:.2f} Kharba"
    elif value >= 100000000:   # 1 Arba
        return f"{value/100000000:.2f} Arba"
    elif value >= 10000000:    # 1 Crore
        return f"{value/10000000:.2f} Cr"
    elif value >= 100000:
        return f"Rs {value:,.0f}"
    else:
        return f"Rs {value:,.0f}" if unit else f"{value:,.0f}"


# ====================== MODELS ======================
class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(100), nullable=False)
    username = db.Column(db.String(100), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password= db.Column(db.String(255), nullable=False)
    some_field_name= db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default="user")


class BudgetSummary(db.Model):
    __tablename__ = "budget_summary"
    id = db.Column(db.Integer, primary_key=True)
    fiscal_year = db.Column(db.String(20))
    total_budget = db.Column(db.Float)
    total_budget_unit = db.Column(db.String(20), default="Crore") 
    total_growth = db.Column(db.Float)
    capital_budget = db.Column(db.Float)
    capital_percentage = db.Column(db.Float)
    own_revenue = db.Column(db.Float)
    own_revenue_percentage = db.Column(db.Float)
    federal_dependency = db.Column(db.Float)
    education = db.Column(db.Float)
    health = db.Column(db.Float)
    infrastructure = db.Column(db.Float)
    agriculture = db.Column(db.Float)


class Ministry(db.Model):
    __tablename__ = "ministries"
    id = db.Column(db.Integer, primary_key=True)
    ministry_name = db.Column(db.String(100), nullable=False)
    nepali_name = db.Column(db.String(100))
    budget_2081 = db.Column(db.Float)
    budget_2080 = db.Column(db.Float)
    budget_share = db.Column(db.Float)


class District(db.Model):
    __tablename__ = "districts"
    id = db.Column(db.Integer, primary_key=True)
    district_name = db.Column(db.String(100), nullable=False)
    population = db.Column(db.Integer)
    allocation = db.Column(db.Float)
    per_citizen = db.Column(db.Float)
    hdi = db.Column(db.Float)
    status = db.Column(db.String(50))


class Revenue(db.Model):
    __tablename__ = "revenue"
    id = db.Column(db.Integer, primary_key=True)
    source = db.Column(db.String(100), nullable=False)
    amount = db.Column(db.Float)
    percentage = db.Column(db.Float)


class Project(db.Model):
    __tablename__ = "projects"
    id = db.Column(db.Integer, primary_key=True)
    project_name = db.Column(db.String(200), nullable=False)
    district = db.Column(db.String(100))
    budget = db.Column(db.Float)
    spent = db.Column(db.Float)
    progress = db.Column(db.Integer)
    status = db.Column(db.String(50))


class Outcome(db.Model):
    __tablename__ = "outcomes"
    id = db.Column(db.Integer, primary_key=True)
    indicator = db.Column(db.String(150), nullable=False)
    province_value = db.Column(db.Float)
    national_value = db.Column(db.Float)
    target_value = db.Column(db.Float)


# ====================== ADMIN DECORATOR ======================
def admin_required(f):
    def decorator(*args, **kwargs):
        if "user" not in session or session.get("role") != "admin":
            flash("Access Denied. Admin only.", "danger")
            return redirect(url_for("login"))
        return f(*args, **kwargs)
    decorator.__name__ = f.__name__
    return decorator


# ====================== PUBLIC PAGES ======================

@app.route("/")
def home():
    summary = BudgetSummary.query.first()
    ministries = Ministry.query.all()
    revenues = Revenue.query.all()
    ministry_chart_data = [
        {"name": m.ministry_name, "budget": m.budget_2081 or 0}
        for m in ministries
    ]
    revenue_chart_data = [
        {"name": r.source, "amount": r.amount or 0}
        for r in revenues
    ]

    return render_template("index.html",
        fiscal_year=summary.fiscal_year if summary else "2081/82",
        total_budget=summary.total_budget if summary else 18.42,
        total_budget_unit=summary.total_budget_unit,
        total_growth=summary.total_growth if summary else 9.6,
        total_growth_unit="%",
        capital_budget=summary.capital_budget if summary else 8.62,
        capital_budget_unit=summary.total_budget_unit,
        capital_percentage=summary.capital_percentage if summary else 47,
        capital_percentage_unit="%",
        own_revenue=summary.own_revenue if summary else 3.10,
        own_revenue_unit=summary.total_budget_unit,
        own_revenue_percentage=summary.own_revenue_percentage if summary else 17,
        own_revenue_percentage_unit="%",
        federal_dependency=summary.federal_dependency if summary else 76,
        education_per_person=summary.education if summary else 1371,
        education_per_person_unit="Rs",
        health_per_person=summary.health if summary else 1052,
        health_per_person_unit="Rs",
        roads_per_person=summary.infrastructure if summary else 1775,
        roads_per_person_unit="Rs",
        agriculture_per_person=summary.agriculture if summary else 801,
        agriculture_per_person_unit="Rs",
        ministries=ministries,
        revenue_sources=revenues,
        ministry_chart_data=ministry_chart_data,   
        revenue_chart_data=revenue_chart_data,  
        last_updated="Baisakh 2082"
    )


@app.route("/ministries")
def ministries():
    return render_template("ministries.html", ministries=Ministry.query.all(), fiscal_year="2081/82", previous_fiscal_year="2080/81")


@app.route("/districts")
def districts():
    return render_template("districts.html", districts=District.query.all())


@app.route("/revenue")
def revenue():
    return render_template("revenue.html", revenue=Revenue.query.all())


@app.route("/projects")
def projects():
    return render_template("projects.html", projects=Project.query.all())


@app.route("/outcomes")
def outcomes():
    return render_template("outcomes.html", outcomes=Outcome.query.all())


# ====================== AUTH ======================

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        user = User.query.filter_by(username=request.form["username"]).first()
        if user and check_password_hash(user.password, request.form["password"]):
            session["user"] = user.username
            session["role"] = user.role
            flash("Login successful!", "success")
            return redirect(url_for("dashboard"))
        flash("Invalid username or password", "danger")
    return render_template("login.html")


@app.route("/logout")
def logout():
    session.clear()
    flash("You have been logged out.", "info")
    return redirect(url_for("login"))


@app.route("/dashboard")
@admin_required
def dashboard():
    summary = BudgetSummary.query.first()
    return render_template("dashboard.html", summary=summary)


# ====================== CRUD OPERATIONS ======================

# === Revenue ===
@app.route("/add-revenue", methods=["GET", "POST"])
@admin_required
def add_revenue():
    if request.method == "POST":
        item = Revenue(
            source=request.form["source"],
            amount=float(request.form["amount"]),
            percentage=float(request.form["percentage"])
        )
        db.session.add(item)
        db.session.commit()
        flash("Revenue added successfully!", "success")
        return redirect(url_for("revenue"))
    return render_template("add_revenue.html")


@app.route("/edit-revenue/<int:id>", methods=["GET", "POST"])
@admin_required
def edit_revenue(id):
    item = Revenue.query.get_or_404(id)
    if request.method == "POST":
        item.source = request.form["source"]
        item.amount = float(request.form["amount"])
        item.percentage = float(request.form["percentage"])
        db.session.commit()
        flash("Revenue updated!", "success")
        return redirect(url_for("revenue"))
    return render_template("edit_revenue.html", revenue=item)


# === Ministry ===
@app.route("/add-ministry", methods=["GET", "POST"])
@admin_required
def add_ministry():
    if request.method == "POST":
        item = Ministry(
            ministry_name=request.form["ministry_name"],
            nepali_name=request.form.get("nepali_name"),
            budget_2081=float(request.form["budget_2081"]),
            budget_2080=float(request.form["budget_2080"]),
            budget_share=float(request.form["budget_share"])
        )
        db.session.add(item)
        db.session.commit()
        flash("Ministry added successfully!", "success")
        return redirect(url_for("ministries"))
    return render_template("add_ministry.html")


@app.route("/edit-ministry/<int:id>", methods=["GET", "POST"])
@admin_required
def edit_ministry(id):
    item = Ministry.query.get_or_404(id)
    if request.method == "POST":
        item.ministry_name = request.form["ministry_name"]
        item.nepali_name = request.form.get("nepali_name")
        item.budget_2081 = float(request.form["budget_2081"])
        item.budget_2080 = float(request.form["budget_2080"])
        item.budget_share = float(request.form["budget_share"])
        db.session.commit()
        flash("Ministry updated!", "success")
        return redirect(url_for("ministries"))
    return render_template("edit_ministry.html", ministry=item)


# === District ===
@app.route("/add-district", methods=["GET", "POST"])
@admin_required
def add_district():
    if request.method == "POST":
        item = District(
            district_name=request.form["district_name"],
            population=int(request.form["population"]),
            allocation=float(request.form["allocation"]),
            per_citizen=float(request.form["per_citizen"]),
            hdi=float(request.form["hdi"]),
            status=request.form["status"]
        )
        db.session.add(item)
        db.session.commit()
        flash("District added successfully!", "success")
        return redirect(url_for("districts"))
    return render_template("add_district.html")


@app.route("/edit-district/<int:id>", methods=["GET", "POST"])
@admin_required
def edit_district(id):
    item = District.query.get_or_404(id)
    if request.method == "POST":
        item.district_name = request.form["district_name"]
        item.population = int(request.form["population"])
        item.allocation = float(request.form["allocation"])
        item.per_citizen = float(request.form["per_citizen"])
        item.hdi = float(request.form["hdi"])
        item.status = request.form["status"]
        db.session.commit()
        flash("District updated!", "success")
        return redirect(url_for("districts"))
    return render_template("edit_district.html", district=item)


# === Project ===
@app.route("/add-project", methods=["GET", "POST"])
@admin_required
def add_project():
    if request.method == "POST":
        item = Project(
            project_name=request.form["project_name"],
            district=request.form["district"],
            budget=float(request.form["budget"]),
            spent=float(request.form["spent"]),
            progress=int(request.form["progress"]),
            status=request.form["status"]
        )
        db.session.add(item)
        db.session.commit()
        flash("Project added successfully!", "success")
        return redirect(url_for("projects"))
    return render_template("add_project.html")


@app.route("/edit-project/<int:id>", methods=["GET", "POST"])
@admin_required
def edit_project(id):
    item = Project.query.get_or_404(id)
    if request.method == "POST":
        item.project_name = request.form["project_name"]
        item.district = request.form["district"]
        item.budget = float(request.form["budget"])
        item.spent = float(request.form["spent"])
        item.progress = int(request.form["progress"])
        item.status = request.form["status"]
        db.session.commit()
        flash("Project updated!", "success")
        return redirect(url_for("projects"))
    return render_template("edit_project.html", project=item)


# === Outcome ===
@app.route("/add-outcome", methods=["GET", "POST"])
@admin_required
def add_outcome():
    if request.method == "POST":
        item = Outcome(
            indicator=request.form["indicator"],
            province_value=float(request.form["province_value"]),
            national_value=float(request.form["national_value"]),
            target_value=float(request.form["target_value"])
        )
        db.session.add(item)
        db.session.commit()
        flash("Outcome added successfully!", "success")
        return redirect(url_for("outcomes"))
    return render_template("add_outcome.html")


@app.route("/edit-outcome/<int:id>", methods=["GET", "POST"])
@admin_required
def edit_outcome(id):
    item = Outcome.query.get_or_404(id)
    if request.method == "POST":
        item.indicator = request.form["indicator"]
        item.province_value = float(request.form["province_value"])
        item.national_value = float(request.form["national_value"])
        item.target_value = float(request.form["target_value"])
        db.session.commit()
        flash("Outcome updated!", "success")
        return redirect(url_for("outcomes"))
    return render_template("edit_outcome.html", outcome=item)
@app.route("/delete-ministry/<int:id>", methods=["GET", "POST"])
def delete_ministry(id):
    if "user" not in session:
        return redirect(url_for("login"))
    if session.get("role") != "admin":
        flash("Access Denied")
        return redirect(url_for("home"))

    ministry = Ministry.query.get_or_404(id)

    if request.method == "POST":
        db.session.delete(ministry)
        db.session.commit()
        flash("Ministry deleted successfully")
        return redirect(url_for("ministries"))

    return render_template("delete_ministry.html", ministry=ministry)


@app.route("/delete-district/<int:id>", methods=["GET", "POST"])
def delete_district(id):
    if "user" not in session:
        return redirect(url_for("login"))
    if session.get("role") != "admin":
        flash("Access Denied")
        return redirect(url_for("home"))

    district = District.query.get_or_404(id)

    if request.method == "POST":
        db.session.delete(district)
        db.session.commit()
        flash("District deleted successfully")
        return redirect(url_for("districts"))

    return render_template("delete_district.html", district=district)


@app.route("/delete-revenue/<int:id>", methods=["GET", "POST"])
def delete_revenue(id):
    if "user" not in session:
        return redirect(url_for("login"))
    if session.get("role") != "admin":
        flash("Access Denied")
        return redirect(url_for("home"))

    revenue_item = Revenue.query.get_or_404(id)

    if request.method == "POST":
        db.session.delete(revenue_item)
        db.session.commit()
        flash("Revenue source deleted successfully")
        return redirect(url_for("revenue"))

    return render_template("delete_revenue.html", revenue_item=revenue_item)


@app.route("/delete-project/<int:id>", methods=["GET", "POST"])
def delete_project(id):
    if "user" not in session:
        return redirect(url_for("login"))
    if session.get("role") != "admin":
        flash("Access Denied")
        return redirect(url_for("home"))

    project = Project.query.get_or_404(id)

    if request.method == "POST":
        db.session.delete(project)
        db.session.commit()
        flash("Project deleted successfully")
        return redirect(url_for("projects"))

    return render_template("delete_project.html", project=project)


@app.route("/delete-outcome/<int:id>", methods=["GET", "POST"])
def delete_outcome(id):
    if "user" not in session:
        return redirect(url_for("login"))
    if session.get("role") != "admin":
        flash("Access Denied")
        return redirect(url_for("home"))

    outcome = Outcome.query.get_or_404(id)

    if request.method == "POST":
        db.session.delete(outcome)
        db.session.commit()
        flash("Outcome deleted successfully")
        return redirect(url_for("outcomes"))

    return render_template("delete_outcome.html", outcome=outcome)


# === Budget Summary ===
@app.route("/edit-summary", methods=["GET", "POST"])
@admin_required
def edit_summary():
    summary = BudgetSummary.query.first()
    if not summary:
        summary = BudgetSummary()
        db.session.add(summary)
    if request.method == "POST":
        summary.fiscal_year = request.form["fiscal_year"]
        summary.total_budget = float(request.form["total_budget"])
        summary.total_budget_unit = request.form["total_budget_unit"]   # NEW
        summary.total_growth = float(request.form["total_growth"])
        summary.capital_budget = float(request.form["capital_budget"])
        summary.capital_percentage = float(request.form["capital_percentage"])
        summary.own_revenue = float(request.form["own_revenue"])
        summary.own_revenue_percentage = float(request.form["own_revenue_percentage"])
        summary.federal_dependency = float(request.form["federal_dependency"])
        summary.education = float(request.form["education"])
        summary.health = float(request.form["health"])
        summary.infrastructure = float(request.form["infrastructure"])
        summary.agriculture = float(request.form["agriculture"])
        db.session.commit()
        flash("Budget Summary updated successfully!", "success")
        return redirect(url_for("dashboard"))
    return render_template("edit_summary.html", summary=summary)

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)