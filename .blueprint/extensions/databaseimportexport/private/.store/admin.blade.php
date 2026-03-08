<?php
  $response = cache()->remember('product-{identifier}', 30 * 60, function () {
    return @file_get_contents("https://api.2038.buzz/products/{identifier}", false, stream_context_create([
      'http' => [
        'timeout' => 1
      ]
    ]));
  });

  if (!$response) {
    $version = 'Unknown';
    $providers = [];
    $changelog = [];
  } else {
    $data = json_decode($response, true);

    $version = $data['product']['version'];
    $providers = array_values($data['providers']);
    $changelog = [];

    foreach ($data['changelogs'] as $key => $change) {
      $changelog[] = [
        'version' => $key,
        'text' => $change['content'],
        'created' => $change['created']
      ];
    }
  }

  $nonceIdentifier = '7b964e627170c6d0b8fc738139b9e595';
  $nonceIdentifierWithoutReplacement = '%%__NONCE' . '__%%';
?>

<div class="row">
  <div class="col-lg-5 col-md-5 col-sm-12 col-xs-12">
    <div class="box {{ $version !== 'Unknown' ? $version !== "{version}" ? 'box-danger' : 'box-primary' : 'box-primary' }}">
      <div class="box-header with-border">
        <h3 class="box-title"><i class='bx bx-git-repo-forked' ></i> Information</h3>
      </div>
      <div class="box-body">
        <p>
          Thank you for purchasing <b>{name}</b>! You are currently using version <code>{version}</code> (latest version is <code>{{ $version }}</code>).
          If you have any questions or need help, please visit our <a href="https://discord.2038.buzz" target="_blank">Discord</a>.
          <b>{{ $nonceIdentifier === $nonceIdentifierWithoutReplacement ? "This is an indev version of the product!" : "" }}</b>
        </p>

        <div class="table-responsive" style="max-height: 250px; margin-bottom: 10px;">
          <table class="table">
            <thead>
              <tr>
                <th style="width: 10px">Version</th>
                <th style="width: 100px">Date</th>
                <th>Changes</th>
              </tr>
            </thead>
            <tbody>
              @foreach ($changelog as $change)
                <tr>
                  <td style="{{ "{version}" === $change['version'] ? 'text-decoration: underline; font-weight: bold;' : '' }}">{{ $change['version'] }}</td>
                  <td>{{ Carbon\Carbon::parse($change['created'])->format('Y-m-d') }}</td>
                  <td style="white-space: pre-wrap;">{{ $change['text'] }}</td>
                </tr>
              @endforeach
            </tbody>
          </table>
        </div>

        <div class="row">
          @foreach ($providers as $provider)
            <div class="col-lg-6 col-md-6 col-sm-6 col-xs-6">
              <a href="{{ $provider['link'] }}" target="_blank" class="btn btn-primary btn-block"><i class='bx bx-store'></i> {{ $provider['name'] }}</a>
            </div>
          @endforeach
        </div>
      </div>
    </div>
  </div>

  <div class="col-lg-3 col-md-3 col-sm-12 col-xs-12">
    <div class="box">
      <div class="box-header with-border">
        <h3 class="box-title"><i class='bx bx-cog'></i> Configuration</h3>
      </div>
      <div class="box-body">
        <form method="post" action="{{ route('admin.extensions.{identifier}.index') }}">
          {{ csrf_field() }}
          <div class="form-group">
            <label for="max_import_size">Max Import Size (MB)</label>
            <input type="number" placeholder="20" name="max_import_size" id="max_import_size" class="form-control" value="{{ $blueprint->dbGet('databaseimportexport', 'max_import_size') ?: '20' }}">
    
            <label for="max_export_size" style="margin-top: 10px">Max Export Size (MB)</label>
            <input type="number" placeholder="50" name="max_export_size" id="max_export_size" class="form-control" value="{{ $blueprint->dbGet('databaseimportexport', 'max_export_size') ?: '50' }}">

            <label for="allow_remote_import" style="margin-top: 10px">Allow Remote Import</label>
            <select name="allow_remote_import" id="allow_remote_import" class="form-control">
              <option value="1" {{ $blueprint->dbGet('databaseimportexport', 'allow_remote_import') === '1' ? 'selected' : '' }}>Yes</option>
              <option value="0" {{ $blueprint->dbGet('databaseimportexport', 'allow_remote_import') === '0' ? 'selected' : '' }}>No</option>
            </select>
          </div>
          <button type="submit" class="btn btn-primary">Save</button>
        </form>
      </div>
    </div>
  </div>

  <div class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
    <div class="box">
      <div class="box-header with-border">
        <h3 class="box-title"><i class='bx bxs-info-square'></i> Banner</h3>
      </div>
      <div class="box-body">
        <img src="{webroot/public}/{identifier}_banner.jpg" class="img-rounded" alt="Banner" style="width: 100%;">
      </div>
    </div>
  </div>
</div>