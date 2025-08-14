from playwright.sync_api import sync_playwright

def verify_seo_tags():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the production URL with parameters
        url_to_check = "https://nms-optimizer.app/?platform=hauler&grid=12345"
        page.goto(url_to_check, wait_until="domcontentloaded")

        # Extract the content of the canonical and og:url tags
        canonical_url = page.locator('link[rel="canonical"]').get_attribute('href')
        og_url = page.locator('meta[property="og:url"]').get_attribute('content')

        # Prepare the verification content to be displayed
        verification_content = f"""
        <h1>SEO Tag Verification</h1>
        <p><strong>Page URL Checked:</strong> {url_to_check}</p>
        <hr>
        <h2>Found Tags:</h2>
        <p><strong>Canonical URL (href):</strong> {canonical_url}</p>
        <p><strong>og:url (content):</strong> {og_url}</p>
        <hr>
        <h2>Verification Result:</h2>
        """

        # Check if the found URLs match the page URL
        if canonical_url == url_to_check and og_url == url_to_check:
            verification_content += '<p style="color:green; font-weight:bold;">SUCCESS: Both tags match the full URL.</p>'
        else:
            verification_content += '<p style="color:red; font-weight:bold;">FAILURE: Tags do not match the full URL.</p>'

        # Overwrite the page content to display the results
        page.set_content(verification_content)

        # Take a screenshot
        page.screenshot(path="jules-scratch/verification/seo_verification.png")

        browser.close()

if __name__ == "__main__":
    verify_seo_tags()
