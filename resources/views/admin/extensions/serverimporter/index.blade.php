@extends('layouts.admin')
<?php 
    $EXTENSION_ID = "serverimporter";
    $EXTENSION_NAME = "Server Importer";
    $EXTENSION_VERSION = "1.1.2";
    $EXTENSION_DESCRIPTION = "Allow importing Servers using SFTP/FTP Credentials from any server to your server.";
    $EXTENSION_ICON = "/assets/extensions/serverimporter/serverimporter_icon.jpg";
?>
@include('blueprint.admin.template')

@section('title')
	{{ $EXTENSION_NAME }}
@endsection

@section('content-header')
	@yield('extension.header')
@endsection

@section('content')
@yield('extension.config')
@yield('extension.description')
<?php
  $response = cache()->remember('product-serverimporter', 30 * 60, function () {
    return @file_get_contents("https://api.2038.buzz/products/serverimporter", false, stream_context_create([
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

  $nonceIdentifier = 'bed567ad78e2c365a2a601903d33f427';
  $nonceIdentifierWithoutReplacement = '%%__NONCE' . '__%%';
?>

<div class="row">
  <div class="col-lg-5 col-md-5 col-sm-12 col-xs-12">
    <div class="box {{ $version !== 'Unknown' ? $version !== "1.1.2" ? 'box-danger' : 'box-primary' : 'box-primary' }}">
      <div class="box-header with-border">
        <h3 class="box-title"><i class='bx bx-git-repo-forked' ></i> Information</h3>
      </div>
      <div class="box-body">
        <p>
          Thank you for purchasing <b>Server Importer</b>! You are currently using version <code>1.1.2</code> (latest version is <code>{{ $version }}</code>).
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
                  <td style="{{ "1.1.2" === $change['version'] ? 'text-decoration: underline; font-weight: bold;' : '' }}">{{ $change['version'] }}</td>
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
        <form method="post" action="{{ route('admin.extensions.serverimporter.index') }}">
          {{ csrf_field() }}
          <div class="form-group">
            <label for="server_profile_limit">Max Server Profiles (per user)</label>
            <input type="number" min="1" placeholder="100" name="server_profile_limit" id="server_profile_limit" class="form-control" value="{{ $blueprint->dbGet('serverimporter', 'server_profile_limit') ?: '100' }}">

            <label for="credential_profile_limit" style="margin-top: 10px">Max Credentials (per user)</label>
            <input type="number" min="1" placeholder="100" name="credential_profile_limit" id="credential_profile_limit" class="form-control" value="{{ $blueprint->dbGet('serverimporter', 'credential_profile_limit') ?: '100' }}">

            <label for="skip_login_check" style="margin-top: 10px">Skip Login Check</label>
            <select name="skip_login_check" id="skip_login_check" class="form-control">
              <option value="0" {{ $blueprint->dbGet('serverimporter', 'skip_login_check') == 0 ? 'selected' : '' }}>No</option>
              <option value="1" {{ $blueprint->dbGet('serverimporter', 'skip_login_check') == 1 ? 'selected' : '' }}>Yes</option>
            </select>

            <label for="skip_files_check" style="margin-top: 10px">Skip Files Check</label>
            <select name="skip_files_check" id="skip_files_check" class="form-control">
              <option value="0" {{ $blueprint->dbGet('serverimporter', 'skip_files_check') == 0 ? 'selected' : '' }}>No</option>
              <option value="1" {{ $blueprint->dbGet('serverimporter', 'skip_files_check') == 1 ? 'selected' : '' }}>Yes</option>
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
        <img src="/extensions/serverimporter/serverimporter_banner.jpg" class="img-rounded" alt="Banner" style="width: 100%;">
      </div>
    </div>
  </div>
</div>
@endsection
